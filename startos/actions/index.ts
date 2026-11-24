import { sdk } from '../sdk'
import { setAdminPassword } from './setAdminPassword'
import { setSubscriptionAddress } from './setSubscriptionAddress'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(setSubscriptionAddress)
