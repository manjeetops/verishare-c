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
  username: { type: 'string', empty: false },
  password: { type: 'string', empty: false },
}

@log
export default class LoginUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform(requestData, ctx) {
    // check user
    // await this.checkUser(requestData)
    const clientConfig = await GetKeycloakClientConfig.perform({
      realm: keycloakConfig['realm_name'],
      client: keycloakConfig['default_client']
    }, ctx)

    const [response, err] = await of(this.loginUser(requestData, clientConfig))
    if (err) {
      ctx.logger.error('Invalid credentials provided', err)
      throw new Error('Invalid user credentials provided')
    }
    return responseHelper({ message: 'You have successfully loggedIn.' }, JSON.parse(response))
  }

  async loginUser({ username, password }, clientConfig, ctx) {
    const internalBaseURL = config.get('keycloak.internal_base_url')
    const realmName = clientConfig['realm']

    const options = {
      method: 'POST',
      uri: `${internalBaseURL}/auth/realms/${realmName}/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        username,
        password,
        'client_id': config.get('keycloak.default_client'),
        'client_secret': clientConfig.credentials.secret,
        'grant_type': 'password'
      }
    }

    const response = await rp(options)

    return response
  }
}
