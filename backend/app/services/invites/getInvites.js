import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import GetInvitations from './crud/getInvitations'
import ActionBase from '../../utils/actionBase'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'

@log
export default class GetInvitesService extends ActionBase {
  @argumentsValidator()
  async perform(ctx) {
    // Get invitations
    const invitations = await GetInvitations.perform({}, ctx)

    return responseHelper({
      message: 'Invitations details has been successfully fetched.'
    }, invitations)
  }
}
