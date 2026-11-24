export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Web Panel': 0,
  'The web panel is ready': 1,
  'The web panel is not ready': 2,

  // interfaces.ts
  'The 3X-UI administration panel': 3,
  Subscriptions: 4,
  'Serves client subscription links that proxy apps import and refresh': 5,
  'Port 443 Inbound': 6,
  'Raw TCP and UDP port 443 for one inbound, usually VLESS with REALITY': 7,
  'Inbound Ports': 8,
  'TCP and UDP ports 20000-20499 for inbounds created in the panel': 9,

  // actions/setAdminPassword.ts
  'Set Admin Password': 10,
  'Generate a new random password for the 3X-UI panel administrator and reset its two-factor authentication.': 11,
  'Replaces the current admin password and turns off two-factor authentication.': 12,
  '3X-UI Admin Credentials': 13,
  'Use these to sign in to the 3X-UI web panel. The password is shown only now.': 14,
  Username: 15,
  Password: 16,

  // init/watchCredentials.ts
  'Set the admin password before signing in to the panel': 17,

  // actions/setSubscriptionAddress.ts
  'Subscription address': 18,
  'The address of the Subscriptions interface that client apps can reach. Choose a public domain or IP for clients outside your network.': 19,
  'The Subscriptions interface has no addresses yet': 20,
  'Set Subscription Address': 21,
  'Choose the address that subscription links in the panel point to.': 22,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
