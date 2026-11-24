<p align="center">
  <img src="icon.png" alt="3X-UI Logo" width="21%">
</p>

# 3X-UI on StartOS

> Everything not listed in this document should behave the same as upstream
> 3X-UI. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[3X-UI](https://github.com/MHSanaei/3x-ui) is a web panel for Xray-core that manages censorship-resistant proxy inbounds, clients and subscriptions.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs upstream's published image unmodified, for x86_64 and aarch64, through upstream's own entrypoint.

- `x-ui` runs the panel, the subscription server and the Xray core. The environment sets `XUI_ENABLE_FAIL2BAN=false`, so the entrypoint starts no fail2ban and goes straight to `x-ui`, and `TZ=Etc/UTC` in place of the image's default time zone.
- `apply-settings` runs once per start, after the panel is listening. It mints an API token named `startos` with `x-ui setting -getApiToken`, then reads and writes the panel's settings through its own `/panel/api/setting` endpoints on `127.0.0.1:2053`.

The service runs without extra capabilities: no TUN device, no `NET_ADMIN`, no iptables.

## Volume and Data Layout

All persistent data is on the `main` volume.

| Path in `main` | Mounted at  | Contents                                              |
| -------------- | ----------- | ----------------------------------------------------- |
| `x-ui/`        | `/etc/x-ui` | The panel's SQLite database: settings, inbounds, clients, users, traffic counters |
| `store.json`   | not mounted | StartOS-side state; see [File Models](#file-models)   |

`/app/bin` (the Xray binary and geo files) and `/var/log/x-ui` live in the image and reset on every restart.

## File Models

`store.json` on the `main` volume holds StartOS-side state and is never read by 3X-UI.

- `adminPassword` records that the admin password has been set. **Set Admin Password** writes it, and the credential task is raised while it is missing. The panel's own user table is authoritative; the stored value is not re-applied.
- `subscriptionUrl` is the subscription address the user chose. **Set Subscription Address** writes it.

The package re-asserts two panel settings on every start, through the panel's API:

- `trustedProxyCIDRs` always gains the StartOS bridge address (`10.0.3.1`). Entries the user adds in the panel are kept; removing the bridge address is undone on the next start.
- `subURI` is set to the chosen subscription address plus the panel's `subPath`, or cleared when no address has been chosen. An edit made in the panel reverts on the next start; change it with **Set Subscription Address** instead.

Every other panel setting belongs to the user.

## Dependencies

None.

## Network Access and Interfaces

The package exposes four interfaces.

| Interface id   | Type  | Container port | Protocol      | Purpose                                                         |
| -------------- | ----- | -------------- | ------------- | --------------------------------------------------------------- |
| `panel`        | `ui`  | 2053           | HTTP, TLS added by StartOS | The administration panel                           |
| `subscription` | `api` | 2096           | HTTP, TLS added by StartOS | Subscription links (path is random per install)    |
| `reality`      | `p2p` | 443            | raw TCP and UDP | One inbound, usually VLESS with REALITY                       |
| `inbounds`     | `api` | 20000-20499    | raw TCP and UDP | A port range for every other inbound, external ports equal internal |

Inbounds the admin creates on any other port listen inside the container but have no route from outside. StartOS's own proxy holds external port 443 on the server, so on the LAN the `reality` binding gets another external port; behind StartTunnel the user forwards public 443 to it.

Share links and QR codes are built by the panel from the hostname the browser used plus the inbound's container port, unless the inbound sets an External Proxy.

## Installation and First-Run Flow

The critical **Set Admin Password** task holds the service stopped until the action has run. The action creates the database with the `admin` account and its generated password, so the panel never starts with any other account. The panel's base path stays `/`, and upstream randomizes the subscription path on first start.

## Actions

- **Set Admin Password** — runs `x-ui setting -username admin -password <generated> -resetTwoFactor` against the database in a temporary container. It works whether the service is running or stopped. A running panel accepts the new password immediately and ends existing sessions. Safe to repeat: each run replaces the password and turns off two-factor authentication. Returns the username and password.
- **Set Subscription Address** — stores the chosen address of the `subscription` interface and restarts the service, which applies it to `subURI`. Safe to repeat. The choice list contains only off-box HTTPS addresses.

## Tasks

- **Set Admin Password** (`critical`) — raised while `store.json` has no `adminPassword`, which is the case after a fresh install. Running the action clears it. It does not return unless `store.json` loses the value.

## Health Checks

- **Web Panel** (`x-ui`) — passes once port 2053 is listening. The panel binds within a few seconds of start; a failure past that means `x-ui` exited, and the service log shows why.

`apply-settings` reports no health check. If it fails, the log shows `Reading 3X-UI settings failed` or `Updating 3X-UI settings failed`.

## Backups and Restore

The whole `main` volume is copied, including the SQLite database and `store.json`. A restored instance comes back with its inbounds, clients, users and settings and needs nothing further.

## Limitations and Differences

1. fail2ban is not run, so per-client IP limits are logged but never enforced.
2. The TUN inbound and kernel-mode AmneziaWG need `NET_ADMIN` and a TUN device and do not work. Userspace AmneziaWG works.
3. Updating Xray, the geo files or the panel from inside the panel writes to the image and is lost on restart.
4. The panel's ACME menu and acme.sh renewal are not used; StartOS terminates TLS for the `panel` and `subscription` interfaces.
5. Inbounds are reachable only on container port 443 and 20000-20499.
6. The panel looks up the server's public IP from several public services every five minutes, and fetches its sponsor list from GitHub. Neither can be turned off.

---

## Quick Reference for AI Consumers

```yaml
package_id: 3x-ui
image: ghcr.io/mhsanaei/3x-ui
architectures: [x86_64, aarch64]
subcontainers: [x-ui, apply-settings]
volumes:
  main: /etc/x-ui (subpath x-ui)
file_models:
  - store.json
startos_managed_env_vars:
  - XUI_ENABLE_FAIL2BAN
  - TZ
dependencies: none
interfaces:
  panel: { type: ui, port: 2053 }
  subscription: { type: api, port: 2096 }
  reality: { type: p2p, port: 443 }
  inbounds: { type: api, port: 20000, port_range: 500 }
actions:
  - set-admin-password
  - set-subscription-address
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - x-ui
```
