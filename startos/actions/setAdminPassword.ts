import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminUsername, dataMountpoint, xuiEnv } from '../utils'

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',

  async ({ effects }) => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'Generate a new random password for the 3X-UI panel administrator and reset its two-factor authentication.',
    ),
    warning: (await storeJson.read((s) => s.adminPassword).const(effects))
      ? i18n(
          'Replaces the current admin password and turns off two-factor authentication.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const adminPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })

    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'x-ui' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: 'x-ui',
        mountpoint: dataMountpoint,
        readonly: false,
      }),
      'set-admin-password',
      async (sub) => {
        await sub.execFail(
          [
            '/app/x-ui',
            'setting',
            '-username',
            adminUsername,
            '-password',
            adminPassword,
            '-resetTwoFactor',
          ],
          { env: xuiEnv },
        )
      },
    )

    await storeJson.merge(effects, { adminPassword })

    return {
      version: '1',
      title: i18n('3X-UI Admin Credentials'),
      message: i18n(
        'Use these to sign in to the 3X-UI web panel. The password is shown only now.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: adminUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: adminPassword,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
