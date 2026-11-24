import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  inboundRangeSize,
  inboundRangeStart,
  panelPort,
  realityPort,
  subPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const panelOrigin = await sdk.MultiHost.of(effects, 'panel').bindPort(
    panelPort,
    { protocol: 'http' },
  )
  const panel = sdk.createInterface(effects, {
    name: i18n('Web Panel'),
    id: 'panel',
    description: i18n('The 3X-UI administration panel'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const subOrigin = await sdk.MultiHost.of(effects, 'subscription').bindPort(
    subPort,
    { protocol: 'http' },
  )
  const subscription = sdk.createInterface(effects, {
    name: i18n('Subscriptions'),
    id: 'subscription',
    description: i18n(
      'Serves client subscription links that proxy apps import and refresh',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const realityOrigin = await sdk.MultiHost.of(effects, 'reality').bindPort(
    realityPort,
    {
      protocol: null,
      addSsl: null,
      preferredExternalPort: realityPort,
      secure: { ssl: false },
    },
  )
  const reality = sdk.createInterface(effects, {
    name: i18n('Port 443 Inbound'),
    id: 'reality',
    description: i18n(
      'Raw TCP and UDP port 443 for one inbound, usually VLESS with REALITY',
    ),
    type: 'p2p',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const inbounds = await sdk.MultiHost.of(effects, 'inbounds').bindPortRange({
    internalStartPort: inboundRangeStart,
    externalStartPort: inboundRangeStart,
    numberOfPorts: inboundRangeSize,
  })
  await inbounds.export(
    sdk.createRangeInterface(effects, {
      id: 'inbounds',
      name: i18n('Inbound Ports'),
      description: i18n(
        'TCP and UDP ports 20000-20499 for inbounds created in the panel',
      ),
    }),
  )

  return [
    await panelOrigin.export([panel]),
    await subOrigin.export([subscription]),
    await realityOrigin.export([reality]),
  ]
})
