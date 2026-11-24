import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: '3x-ui',
  title: '3X-UI',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/gStart9/3x-ui-startos',
  upstreamRepo: 'https://github.com/MHSanaei/3x-ui',
  marketingUrl: 'https://docs.sanaei.dev/',
  donationUrl: 'https://www.buymeacoffee.com/MHSanaei',
  description: { short, long },
  volumes: ['main'],
  images: {
    'x-ui': {
      source: { dockerTag: 'ghcr.io/mhsanaei/3x-ui:v3.11.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
