import of from 'await-of';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import ActionBase from '../../utils/actionBase';
import { log } from '../../utils/decorators/log';
import { BuildAndSendTransactionService } from '../blockchain';
import GetUserByToken from '../user/getUserByToken';
import responseHelper from '../../helpers/responseHelper';

const schema = {
  keycloakToken: {
    type: 'object',
    props: {
      content: {
        type: 'object',
        props: {
          sub: { type: 'string' }
        }
      }
    }
  },
  organization_id: { type: 'string' }
};

@log
export default class GetOrganizationService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ organization_id: orgId, keycloakToken }, ctx) {
    //get user by access token
    const user = await GetUserByToken.perform(keycloakToken, ctx);

    const payload = {
      action: 'get_organization'
    };

    const params = { orgId: orgId };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: user.blockchainId,
        params
      })
    );

    if (error) {
      ctx.logger.error('Could not fetch oranization', error);
      throw new Error(error.message);
    }

    //customize response
    response.id = response.identifier.id
    delete response.identifier
    delete response.host
    delete response.parties

    return responseHelper(
      {
        message: `Organization details has been successfully fetched`,
      },
      response
    );
  }
}
