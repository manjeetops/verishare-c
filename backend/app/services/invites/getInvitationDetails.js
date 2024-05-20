import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import GetInvitation from './crud/getInvitation'
import CheckInvitation from './checkInvitation'
import responseHelper from '../../helpers/responseHelper'
import ActionBase from '../../utils/actionBase'
import { log } from '../../utils/decorators/log'

const schema = {
  'invitation_code': { type: 'string' }
}

@log
export default class GetInvitationDetailsService extends ActionBase {
  @argumentsValidator(schema)
  async perform(reqData, ctx) {
    const invitation = await GetInvitation.perform({ invitation_code: reqData['invitation_code'] }, ctx)

    const { validTill, firstName, lastName } = invitation

    await CheckInvitation.perform({ validTill: validTill }, ctx)
    
    return responseHelper({
      message: 'Invitation details has been successfully fetched.'
    }, { firstName: firstName, lastName: lastName })
  }
}
