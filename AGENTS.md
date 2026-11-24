# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Change panel settings through the panel's API, as `applyPanelSettings` in `startos/utils.ts` does. The image has no `sqlite3`, and `x-ui setting` has no flags for `trustedProxyCIDRs` or `subURI`.
- Send the whole object from `/panel/api/setting/all` back to `/panel/api/setting/update`. The update endpoint writes every field of its settings struct, so a partial body overwrites the missing settings with zero values.
- Testing the panel with `curl` through the StartOS proxy needs a CSRF token: fetch `/csrf-token` with a cookie jar and send it as `_csrf` (form) or `X-CSRF-Token` (header). Without one, every POST returns 403 with a log line saying `CSRF validation failed`.
