import of from 'await-of'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import ActionBase from '../../../utils/actionBase'
import { log } from '../../../utils/decorators/log'
import config from '../../../../config/app'

const schema = {
  userData: {
    type: 'object',
    props: {
      email: { type: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      credentials: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            type: 'string',
            value: 'string',
            temporary: 'boolean'
          }
        }
      }
    }
  },
  keycloakAdminClient: {
    type: 'object',
    props: {
      realms: { type: 'object' },
      users: { type: 'object' },
      clients: { type: 'object' },
      groups: { type: 'object' }
    }
  }
}

const keycloakConfig = config.get('keycloak')

@log
export default class KeycloakCreateUserService extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ userData, keycloakAdminClient }, ctx) {
    // username is required field in keycloak
    userData['username'] = userData['email']
    userData['enabled'] = true
    const [response, err] = await of(keycloakAdminClient.users.create(keycloakConfig['realm_name'], userData))
    if (err) {
      ctx.logger.error('createUserOnKeycloakFailed', err)
      throw new Error('createUserOnKeycloakFailed')
    }
    return response['id']
  }
}
