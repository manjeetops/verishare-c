import ActionBase from '../../../utils/actionBase'
import GetKeycloakConnectConfig from './getKeycloakConnectConfig'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import config from '../../../../config/app'
import { log } from '../../../utils/decorators/log'

const { default_client } = config.get('keycloak')

const schema = {
  realm: { type: 'string' }
}

@log
export default class GetKeycloakInstance extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm }, ctx) {
    const keycloakInstance = await GetKeycloakConnectConfig.perform({
      realm: realm,
      client: default_client,
      scope: 'offline_access'
    }, ctx)

    return keycloakInstance
  }
}
