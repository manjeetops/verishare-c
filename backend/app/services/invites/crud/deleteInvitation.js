import { Invitation } from '../../../../entity/invitation'
import { getRepository } from 'typeorm'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import ActionBase from '../../../utils/actionBase'
import of from 'await-of'
import { log } from '../../../utils/decorators/log'

const schema = {
  id: { type: 'string' }
}

@log
export default class DeleteInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform(reqData, ctx) {
    const InvitationRepositary = await getRepository(Invitation)
    const [result, err] = await of(InvitationRepositary.remove(reqData))
    if (err) {
      ctx.logger.error('deleteInvitationFailed', err)
      throw new Error('deleteInvitationFailed')
    }
    return result
  }
}
