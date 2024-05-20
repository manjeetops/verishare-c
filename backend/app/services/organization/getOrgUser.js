import _ from 'lodash';
import of from 'await-of';
import ActionBase from '../../utils/actionBase';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import { BuildAndSendTransactionService } from '../blockchain';
import { log } from '../../utils/decorators/log';
import GetUser from '../user/getUser';

const schema = {
  user_id: { type: 'string' },
  keycloakSubId: { type: 'string' }
};

@log
export default class AdminGetOrgUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ user_id: userId, keycloakSubId }, ctx) {
    // Fetch user by keycloakId
    const user = await GetUser.perform({ keycloakId: keycloakSubId });
    if (!user) {
      throw new Error(`User ${keycloakSubId} not found`);
    }

    const payload = {
      action: 'get_user_by_id'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: user.blockchainId,
        params: { userId: userId }
      })
    );

    if (error) {
      ctx.logger.error('User not found', error);
      throw new Error(`User ${userId} not found`);
    }

    //customize response
    delete response.parties
    delete response.adminPublicKey

    return responseHelper(
      {
        message: 'User details have been successfully fetched'
      },
      response
    );
  }
}
