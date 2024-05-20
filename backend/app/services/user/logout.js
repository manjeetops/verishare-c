import of from 'await-of'
import rp from 'request-promise'
import _ from 'lodash'
import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import config from '../../../config/app'
import GetKeycloakClientConfig from '../keycloak/connect/getKeycloakClientConfig'
import responseHelper from '../../helpers/responseHelper'
import { log } from '../../utils/decorators/log'

const keycloakConfig = config.get('keycloak')

const schema = {
  'refresh_token': { type: 'string', empty: false },
}

@log
export default class LogoutUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform({ refresh_token: refreshToken }, ctx) {
    const clientConfig = await GetKeycloakClientConfig.perform({
      realm: keycloakConfig['realm_name'],
      client: keycloakConfig['default_client']
    }, ctx)

    await this.logoutUser(refreshToken, clientConfig, ctx)
    return responseHelper({
      message: 'User has been successfully logged out'
    })
  }

  async logoutUser(refreshToken, clientConfig, ctx) {
    const internalBaseURL = config.get('keycloak.internal_base_url')
    const realmName = clientConfig['realm']

    const options = {
      method: 'POST',
      uri: `${internalBaseURL}/auth/realms/${realmName}/protocol/openid-connect/logout`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'refresh_token': refreshToken,
        'client_id': config.get('keycloak.default_client'),
        'client_secret': clientConfig.credentials.secret,
        'grant_type': 'password'
      }
    }
    const [response, error] = await of(rp(options))
    if (error) {
      ctx.logger.error('Error while logout the user', error)
      throw new Error('Error while logout the user')
    }

    return response
  }
}
