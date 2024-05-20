import of from 'await-of'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import ActionBase from '../../utils/actionBase'
import Logger from '../../../server/logger';
import { log } from '../../utils/decorators/log';

const schema = {
  realm: { type: 'string' },
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
export default class GetRealmClients extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm, keycloakAdminClient }, ctx) {
    const [clients, err] = await of(keycloakAdminClient.clients.find(realm))
    if (err) {
      ctx.logger.error(`getRealm ${err}`)
      throw new Error('Error in fetching realm')
    }
    return clients
  }
}
