import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { applyPanelSettings, dataMountpoint, panelPort, xuiEnv } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const subscriptionUrl = await storeJson
    .read((s) => s.subscriptionUrl)
    .const(effects)
  const osIp = await sdk.getOsIp(effects)

  const mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: 'x-ui',
    mountpoint: dataMountpoint,
    readonly: false,
  })

  return sdk.Daemons.of(effects)
    .addDaemon('x-ui', {
      subcontainer: sdk.SubContainer.of(
        effects,
        { imageId: 'x-ui' },
        mounts,
        'x-ui',
      ),
      exec: { command: sdk.useEntrypoint(), env: xuiEnv },
      ready: {
        display: i18n('Web Panel'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, panelPort, {
            successMessage: i18n('The web panel is ready'),
            errorMessage: i18n('The web panel is not ready'),
          }),
      },
      requires: [],
    })
    .addOneshot('apply-settings', {
      subcontainer: sdk.SubContainer.of(
        effects,
        { imageId: 'x-ui' },
        mounts,
        'apply-settings',
      ),
      exec: {
        fn: async (sub) => {
          await applyPanelSettings(sub, osIp, subscriptionUrl ?? undefined)
          return null
        },
      },
      requires: ['x-ui'],
    })
})
