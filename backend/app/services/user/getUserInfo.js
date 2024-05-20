import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';
import of from 'await-of';

const schema = {
  keycloakSubId: { type: 'string' }
};

@log
export default class GetUserInfo extends ActionBase {
  @argumentsValidator(schema)
  async perform({ keycloakSubId }, ctx) {
    const user = await GetUser.perform({ keycloakId: keycloakSubId }, ctx);

    if (!user) {
      throw new Error(`User not valid`);
    }

    const payload = {
      action: 'get_user_by_id'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: user.blockchainId,
        params: { userId: user.blockchainId }
      })
    );

    if (error) {
      ctx.logger.error('User not found', error);
      throw new Error(`User ${userId} not found`);
    }

    //customize response
    delete response.parties;
    delete response.adminPublicKey;

    return responseHelper(
      {
        message: 'User details have been successfully fetched'
      },
      response
    );
  }
}
