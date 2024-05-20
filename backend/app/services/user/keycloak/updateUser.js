import of from 'await-of'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import ActionBase from '../../../utils/actionBase'
import config from '../../../../config/app'

const schema = {
  keycloakAdminClient: {
    type: 'object',
    props: {
      realms: { type: 'object' },
      users: { type: 'object' },
      clients: { type: 'object' },
      groups: { type: 'object' }
    }
  },
}

const keycloakConfig = config.get('keycloak')

export default class KeycloakUpdateUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ userData, keycloakAdminClient }, ctx) {
    const [response, err] = await of(keycloakAdminClient.users.update(keycloakConfig['realm_name'], userData))
    if (err) {
      ctx.logger.error('Error updating user on keycloak', err)
      throw new Error('Error updating user on keycloak')
    }
    return response
  }
}
