import of from 'await-of';
import ActionBase from '../../utils/actionBase';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import { Account } from '../../../entity/account';
import { USER_TYPE_ENUM } from '../../helpers/constants';
import { log } from '../../utils/decorators/log';
import { getRepository } from 'typeorm';

const schema = {
  keycloakToken: {
    type: 'object',
    optional: true,
    props: {
      content: {
        type: 'object',
        props: {
          sub: { type: 'string' }
        }
      }
    }
  }
};

@log
export default class GetServiceAccountService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ keycloakToken }, ctx) {

    const account = await this.getServiceAccount()
    return responseHelper(
      {
        message: 'Service accounts details have been successfully fetched'
      },
      account
    );
  }

  async getServiceAccount() {
    const AccountRepositary = await getRepository(Account);
    const [result, err] = await of(
      AccountRepositary.findOne({ role: USER_TYPE_ENUM.SERVICE_ACCOUNT })
    );

    if (err) {
      ctx.logger.error('could not get user account', err);
      throw new Error(err.message);
    }

    if (!result) {
      ctx.logger.error('could not get user account', err);
      throw new Error('Admin not found for this organization');
    }

    return result;
  }
}
