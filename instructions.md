# 3X-UI

## Documentation

- [3x-ui documentation](https://docs.sanaei.dev/docs) — the upstream guide to panel settings, inbounds, REALITY, clients, subscriptions and share links.

## What you get on StartOS

- **Web Panel** — the 3X-UI administration panel, where you create inbounds and clients.
- **Subscriptions** — the subscription server that client apps import and refresh.
- **Port 443 Inbound** — one raw TCP and UDP port, mapped to port 443 inside the service. Use it for the inbound you most want to look like ordinary HTTPS, usually VLESS with REALITY.
- **Inbound Ports** — the 500 TCP and UDP ports 20000 through 20499, for every other inbound.

Inbounds can only be reached on port 443 or on a port from 20000 to 20499. An inbound you create on any other port runs, but nothing outside the server can reach it.

## Getting set up

1. Run **Set Admin Password** and save the username and password it shows you.
2. Open the **Web Panel** interface and sign in. Turn on two-factor authentication under the panel's security settings if you want it.
3. If clients will connect from outside your network, publish the interfaces they use. Behind StartTunnel, forward the port shown for **Port 443 Inbound** (ideally from public port 443) and the range 20000-20499 for **Inbound Ports**.
4. Run **Set Subscription Address** and choose the address of the **Subscriptions** interface that your clients can reach.

## Using 3X-UI

### Creating inbounds

Create inbounds in the panel on port 443 or on a port from 20000 to 20499. REALITY works best on port 443, so put your main VLESS with REALITY inbound there.

The share links and QR codes the panel shows use the address you opened the panel with, plus the inbound's port. Open the panel through the same public domain or IP your clients will use, or set an External Proxy on the inbound, so that the links point somewhere your clients can reach. For the port 443 inbound, the link says 443, so the public port that reaches **Port 443 Inbound** must also be 443.

### Actions

- **Set Admin Password** — generates a new random password for the `admin` account and turns off two-factor authentication. Run it again if you lose the password or your authenticator.
- **Set Subscription Address** — chooses the address that subscription links in the panel point to. Run it again whenever that address changes. The service restarts to apply it.

### Outbound traffic

Traffic your clients send through 3X-UI leaves from this server, so the sites they visit see the server's outbound address. If you publish 3X-UI through a tunnel to keep your home IP private, send the server's outbound traffic through that tunnel too. If you use the tunnel for another reason, such as a port your router cannot forward, there is nothing to change.

3X-UI also looks up the server's public IP address from several public services every few minutes. The lookup can't be turned off.

## Limitations

- Updating Xray or the panel from inside the panel does not survive a restart. Update by installing a newer version of this service.
- The panel's SSL certificate menu is not used. StartOS provides the HTTPS certificates for the **Web Panel** and **Subscriptions** interfaces.
- Per-client IP limits are logged but not enforced, because they rely on a firewall the service cannot change.
