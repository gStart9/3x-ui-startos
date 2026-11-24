import { SubContainer } from '@start9labs/start-sdk'
import { manifest } from './manifest'

export const panelPort = 2053
export const subPort = 2096
export const realityPort = 443
export const inboundRangeStart = 20000
export const inboundRangeSize = 500
export const adminUsername = 'admin'
export const dataMountpoint = '/etc/x-ui'

export const xuiEnv = {
  XUI_ENABLE_FAIL2BAN: 'false',
  TZ: 'Etc/UTC',
}

type PanelSettings = Record<string, unknown> & {
  trustedProxyCIDRs?: string
  subPath?: string
  subURI?: string
}

async function panelApi(
  sub: SubContainer<typeof manifest>,
  token: string,
  path: string,
  body?: PanelSettings,
): Promise<{ success: boolean; msg?: string; obj?: PanelSettings }> {
  const args = [
    'curl',
    '-sS',
    '--fail-with-body',
    '-X',
    'POST',
    '-H',
    `Authorization: Bearer ${token}`,
  ]
  if (body) {
    args.push(
      '-H',
      'Content-Type: application/json',
      '--data',
      JSON.stringify(body),
    )
  }
  args.push(`http://127.0.0.1:${panelPort}/panel/api/setting/${path}`)
  const res = await sub.execFail(args)
  return JSON.parse(res.stdout.toString())
}

/**
 * Applies proxy trust and the subscription address through the panel's own settings API.
 * Requires the panel to be running in the same network namespace.
 */
export async function applyPanelSettings(
  sub: SubContainer<typeof manifest>,
  osIp: string,
  subscriptionUrl: string | undefined,
) {
  const tokenOut = await sub.execFail(
    [
      '/app/x-ui',
      'setting',
      '-getApiToken',
      '-tokenName',
      'startos',
      '-tokenScope',
      'admin',
    ],
    { env: xuiEnv },
  )
  const token = tokenOut.stdout.toString().match(/apiToken:\s*(\S+)/)?.[1]
  if (!token) throw new Error('3X-UI did not return an API token')

  const current = await panelApi(sub, token, 'all')
  if (!current.success || !current.obj) {
    throw new Error(`Reading 3X-UI settings failed: ${current.msg ?? ''}`)
  }
  const settings = current.obj

  const trusted = (settings.trustedProxyCIDRs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const subURI = subscriptionUrl
    ? subscriptionUrl.replace(/\/+$/, '') + (settings.subPath ?? '/sub/')
    : ''

  const trustOk = trusted.includes(osIp)
  if (trustOk && settings.subURI === subURI) return

  const updated = await panelApi(sub, token, 'update', {
    ...settings,
    trustedProxyCIDRs: trustOk
      ? trusted.join(',')
      : [...trusted, osIp].join(','),
    subURI,
  })
  if (!updated.success) {
    throw new Error(`Updating 3X-UI settings failed: ${updated.msg ?? ''}`)
  }
}
