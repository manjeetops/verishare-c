import moment from 'moment'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import GetInvitation from './crud/getInvitation'
import UpdateInvitation from './crud/updateInvitation'
import ActionBase from '../../utils/actionBase'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'

const schema = {
  'invitation_id': { type: 'string' },
  'validTill': { type: 'date' },
}

@log
export default class UpdateInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ invitation_id, validTill }, ctx) {
    // Get invitation
    const invitation = await GetInvitation.perform({ invitation_id: invitation_id }, ctx)

    if (!(invitation && invitation['invitation_id'])) {
      throw new Error('invalidInvitation: Invitation not found')
    }

    if (invitation['joined']) {
      throw new Error('updateFailed: User already joined')
    }

    await UpdateInvitation.perform({ invitation_id: invitation_id, valid_till: moment(validTill).toDate() }, ctx)

    return responseHelper({
      message: `Invitation '${invitation_id}' has been successfully Updated`
    }, { ...invitation._doc, validTill })
  }
}
