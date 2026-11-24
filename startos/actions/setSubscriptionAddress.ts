import { T } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const subscriptionUrls = (effects: T.Effects) =>
  sdk.host.getOwn(effects, 'subscription', (host) => {
    const iface =
      host &&
      Object.values(host.bindings)
        .flatMap((b) => Object.values(b.interfaces))
        .find((i) => i.id === 'subscription')
    return iface
      ? [
          ...new Set(
            iface.addressInfo.nonLocal
              .filter({ predicate: (h) => h.ssl })
              .format(),
          ),
        ]
      : []
  })

const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = (await subscriptionUrls(effects).once()) ?? []
    return {
      name: i18n('Subscription address'),
      description: i18n(
        'The address of the Subscriptions interface that client apps can reach. Choose a public domain or IP for clients outside your network.',
      ),
      values: Object.fromEntries(urls.map((u) => [u, u])),
      default: null,
      disabled: urls.length
        ? false
        : i18n('The Subscriptions interface has no addresses yet'),
    }
  }),
})

export const setSubscriptionAddress = sdk.Action.withInput(
  'set-subscription-address',

  async () => ({
    name: i18n('Set Subscription Address'),
    description: i18n(
      'Choose the address that subscription links in the panel point to.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => {
    const url = await storeJson.read((s) => s.subscriptionUrl).once()
    return url ? { url } : {}
  },

  async ({ effects, input }) => {
    await storeJson.merge(effects, { subscriptionUrl: input.url })
  },
)
