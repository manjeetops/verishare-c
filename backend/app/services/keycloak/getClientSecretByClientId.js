import of from 'await-of'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import ActionBase from '../../utils/actionBase'
import logger from '../../../server/logger';
import { log } from '../../utils/decorators/log';

const schema = {
  realm: { type: 'string' },
  clientId: { type: 'string' },
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

@log
export default class GetClientSecretByClientId extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm, clientId, keycloakAdminClient }, ctx) {
    const [client, err] = await of(keycloakAdminClient.clients.getClientSecret(realm, clientId))
    if (err) {
      ctx.logger.error('clientSecret', err)
      throw new Error('Error getting client secret by client id')
    }
    return client
  }
}
