import { Invitation } from '../../../../entity/invitation'
import { getRepository } from 'typeorm'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import ActionBase from '../../../utils/actionBase'
import of from 'await-of'
import { log } from '../../../utils/decorators/log'

const schema = {
  invitation_id: { type: 'string' },
  // TODO: add params
  valid_till: { type: 'date', optional: true },
  joined: { type: 'boolean', optional: true }
}

@log
export default class UpdateInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ invitation_id, valid_till, joined }, ctx) {
    // TODO: change
    let params
    if (valid_till) {
      params = { valid_till }
    } else {
      params = { joined }
    }
    const InvitationRepositary = await getRepository(Invitation)
    const [result, err] = await of(InvitationRepositary.update({ id: invitation_id }, params))
    if (err) {
      ctx.logger.error('updateInvitationFailed', err)
      throw new Error('updateInvitationFailed')
    }

    return result
  }
}
