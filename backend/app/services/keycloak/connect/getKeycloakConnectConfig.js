import ActionBase from '../../../utils/actionBase'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import Keycloak from '../../../utils/keycloak'
import GetKeycloakClientConfig from './getKeycloakClientConfig'
import { log } from '../../../utils/decorators/log'

const schema = {
  realm: { type: 'string' },
  client: { type: 'string' },
  scope: { type: 'string' }
}

@log
export default class GetKeycloakConnectConfig extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm, client, scope }, ctx) {
    const config = await GetKeycloakClientConfig.perform({ realm, client }, ctx)

    const keycloakConfig = new Keycloak({ store: true, scope: scope }, config)
    return keycloakConfig
  }
}
