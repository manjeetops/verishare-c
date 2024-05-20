import of from 'await-of'
import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import responseHelper from '../../helpers/responseHelper'
import config from '../../../config/app'
import GetKeycloakClientConfig from '../keycloak/connect/getKeycloakClientConfig'
import { log } from '../../utils/decorators/log'
import GetUser from '../user/getUser';

const keycloakConfig = config.get('keycloak')

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
  },
  'service_account_id': { type: 'string', empty: false }
}

@log
export default class GetServiceAccountCredentialsService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ service_account_id: serviceAccId }, ctx) {

    const user = await GetUser.perform({ blockchainId: serviceAccId }, ctx)
    
    if(!user){
      throw new Error(`User not found: ${serviceAccId}`)
    }
    if (user.role !== 'SERVICE') {
      throw new Error('The given service_account_id does not belong to service_account')
    }
    // fetching the client credentials
    const client = keycloakConfig['default_client']
    const [clientConfig, error] = await of(GetKeycloakClientConfig.perform({ realm: keycloakConfig['realm_name'], client }, ctx))
    if (error) {
      ctx.logger.error('Error while fetching the client secret', error)
      throw new Error('Error while fetching the client secret')
    }

    return responseHelper({
      message: 'Credentials for the service account have been successfully fetched',
    }, { clientId: client, clientSecret: clientConfig.credentials.secret })
  }
}
