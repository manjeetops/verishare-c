import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import GetKeycloakAdminClient from '../keycloak/admin/GetKeycloakAdminClient';
import ActionBase from '../../utils/actionBase';
import responseHelper from '../../helpers/responseHelper';
import UpdateUserOnKeycloak from '../user/keycloak/updateUser';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUser from '../user/getUser';

const schema = {
  user_id: { type: 'string' },
  keycloakSubId: { type: 'string' }
};

@log
export default class BlockUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ user_id: userId, keycloakSubId, status }, ctx) {
    // fetch user
    const admin = await GetUser.perform({ keycloakId: keycloakSubId });
    if (!admin) {
      throw new Error(`Admin ${keycloakSubId} not found`);
    }

    const user = await GetUser.perform({ blockchainId: userId });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const payload = {
      action: 'update_user_status',
      options: {
        body: {
          status: status.toUpperCase()
        }
      }
    };

    const [response, err] = await of(
      BuildAndSendTransactionService.perform(
        {
          payload,
          uuid: admin.blockchainId,
          params: { userId: user.blockchainId }
        },
        ctx
      )
    );

    if (err) {
      ctx.logger.error('Could not update user status', err);
      throw new Error(err.message);
    }

    const keycloakAdminClient = await this.getKeycloakAdminClient(ctx);
    await UpdateUserOnKeycloak.perform(
      {
        keycloakAdminClient,
        userData: {
          id: user.keycloakId,
          enabled: false
        }
      },
      ctx
    );

    //Customize response
    delete response.parties
    delete response.adminPublicKey

    return responseHelper(
      {
        message: 'User status has been successfully updated'
      },
      { response }
    );
  }

  async getKeycloakAdminClient(ctx) {
    const keycloakAdminClient = await GetKeycloakAdminClient.perform({}, ctx);
    return keycloakAdminClient;
  }
}
