import of from 'await-of'
import rp from 'request-promise'
import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import config from '../../../config/app'
import GetKeycloakClientConfig from '../keycloak/connect/getKeycloakClientConfig'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'
import Logger from '../../../server/logger'

const keycloakConfig = config.get('keycloak')

const schema = {
  refreshToken: { type: 'string', empty: false },
}

@log
export default class GetNewAccessTokenService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ refreshToken }, ctx) {
    const client = keycloakConfig['default_client']
    const [clientConfig, error] = await of(GetKeycloakClientConfig.perform({ realm: keycloakConfig['realm_name'], client }, ctx))
    if (error) {
      ctx.logger.error('Error while fetching the client secret', error)
      throw new Error('Error while fetching the client secret')
    }
    const [response, error2] = await this.getNewAccessToken(clientConfig, refreshToken)
    if (error2) {
      ctx.logger.error('Invalid refresh token', error2)
      throw new Error('Invalid refresh token')
    }
    return responseHelper({
      message: 'New access token has been successfully generated.'
    }, JSON.parse(response))
  }

  async getNewAccessToken(clientConfig, refreshToken) {
    const internalBaseURL = config.get('keycloak.internal_base_url')
    const realmName = clientConfig['realm']

    const options = {
      method: 'POST',
      uri: `${internalBaseURL}/auth/realms/${realmName}/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'client_id': config.get('keycloak.default_client'),
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
        'client_secret': clientConfig.credentials.secret
      }
    }
    const response = await of(rp(options))
    return response
  }
}
