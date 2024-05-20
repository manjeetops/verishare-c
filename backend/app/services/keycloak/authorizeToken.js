import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import rp from 'request-promise'
import config from '../../../config/app'
import of from 'await-of'
import { log } from '../../utils/decorators/log'

const { internal_base_url } = config.get('keycloak')

const schema = {
  token: { type: 'string' },
  realmName: { type: 'string' },
  scope: { type: 'string' },
  resource: { type: 'string' },
  clientId: { type: 'string' }
}

@log
export default class AuthorizeTokenService extends ActionBase {
  @argumentsValidator(schema)
  async perform (requestData) {
    const { response, err } = await this.checkAuthorization(requestData)
    if (err) {
      throw new Error(`invalidAuthPermission ==> ${err}`)
    }
    return response
  }

  /**
   * Reference Link - https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_obtaining_permissions
   * Enforcer keycloak-connect - https://github.com/keycloak/keycloak-nodejs-connect/blob/master/example/index.js
   * Invalid grant type - https://github.com/thephpleague/oauth2-server/issues/261
   */
  async checkAuthorization ({ clientId, resource, realmName, scope, token }) {
    const options = {
      method: 'POST',
      uri: `${internal_base_url}/auth/realms/${realmName}/protocol/openid-connect/token`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'grant_type': 'urn:ietf:params:oauth:grant-type:uma-ticket',
        'audience': clientId,
        'permission': `${resource}#${scope}`
      }
    }
    const [response, err] = await of(rp(options))
    return { response, err: err['error'] }
  }
}
