import { Invitation } from '../../../../entity/invitation';
import { getRepository } from 'typeorm';
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator';
import ActionBase from '../../../utils/actionBase';
import of from 'await-of';
import { log } from '../../../utils/decorators/log';

const schema = {
  id: { type: 'string', optional: true },
  invitationCode: { type: 'string', optional: true },
  email: { type: 'email', optional: true },
  orgId: { type: 'string', optional: true },
  inviterAccountId: { type: 'string', optional: true }
};

@log
export default class GetInvitationService extends ActionBase {
  @argumentsValidator(schema)
  async perform(reqData, ctx) {
    const InvitationRepositary = await getRepository(Invitation);
    const [result, err] = await of(InvitationRepositary.findOne(reqData));
    if (err) {
      ctx.logger.error(`Could not fetch invitation`, err);
      throw new Error(`Could not fetch invitation`);
    }
    if (!result) {
      throw new Error('invitationFailed: Invitation Not Found');
    }
    return result;
  }
}
