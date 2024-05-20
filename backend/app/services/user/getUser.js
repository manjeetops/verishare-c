import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import { Account } from '../../../entity/account';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import { getRepository } from 'typeorm';

const schema = {
  email: { type: 'email', optional: true },
  keycloakId: { type: 'string', optional: true },
  blockchainId: { type: 'string', optional: true }
};

@log
export default class GetUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform(reqData, ctx) {
    const AccountRepositary = getRepository(Account);
    const [account, err] = await of(AccountRepositary.findOne(reqData));

    if (err) {
      throw new Error(`Error fetching user from db`);
    }
    return account;
  }
}
