import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import GetInvitation from './crud/getInvitation'
import DeleteInvitation from './crud/deleteInvitation'
import ActionBase from '../../utils/actionBase'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'

const schema = {
  'invitation_id': { type: 'string' },
}

@log
export default class DeleteInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ invitation_id }, ctx) {
    // Get invitation
    const invitation = await GetInvitation.perform({ id: invitation_id }, ctx)

    if (!(invitation && invitation['id'])) {
      throw new Error('invalidInvitation: Invitation not found')
    }

    if (invitation['joined']) {
      throw new Error('deletionFailed: User already joined')
    }

    await DeleteInvitation.perform({ id: invitation_id }, ctx)

    return responseHelper({
      message: `Invitation '${invitation_id}' has been successfully deleted`
    }, invitation)
  }
}
