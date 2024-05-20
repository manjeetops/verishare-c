import GetKeycloakConnectConfig from '../services/keycloak/connect/getKeycloakConnectConfig'
import ConnectSequence from 'connect-sequence'
import config from '../../config/app'
import Logger from '../../server/logger';

/***
 * Middleware types
 * LOGIN
 * GRANT (for callback)
 * GRANT_ATTACHER
 * LOGOUT
 */

const keycloakConfig = config.get('keycloak')

export default function (middlewareType) {
  return async function keyclockOrgSelector (req, res, next) {
    const seq = new ConnectSequence(req, res, next)
    const [connectConfig, err] = await GetKeycloakConnectConfig.run({
      realm: keycloakConfig['realm_name'],
      client: config.get('keycloak.default_client'),
      scope: 'offline_access'
    })
    if (!connectConfig || err) {
      Logger.error(`organization error: realm not found on keycloak`)
      return res.boom.notFound(`organization error: realm not found on keycloak`)
    }
    const middlewares = connectConfig.middleware(false, middlewareType)
    req['keycloak_instance'] = connectConfig
    seq.append(...middlewares).run()
  }
}
