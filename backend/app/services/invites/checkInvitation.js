import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import ActionBase from '../../utils/actionBase'
import moment from 'moment'
import { log } from '../../utils/decorators/log'

const schema = {
  status: { type: 'string', optional: true },
  validTill: { type: 'string', optional: true }
}

@log
export default class CheckInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ validTill }, ctx) {
    const currentDate = moment().format('YYYY-MM-DD')
    const isValid = moment(validTill).isSameOrAfter(moment(currentDate))
    if (!isValid) {
      throw new Error('invalidInvitation: Invitation has been expired')
    }
    return true
  }
}
