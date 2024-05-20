import ActionBase from '../../../utils/actionBase'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import MemoryCache from '../../../utils/memoryCache'
import KeycloakAdminClient from './client'

const configCache = new MemoryCache(5)

const schema = {
  realm: { type: 'string' },
  client: { type: 'string' }
}

export default class GetClientConfigs extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm, client }) {
    const cacheKey = `${realm}__${client}`
    const cacheResult = configCache.get(cacheKey)
    if (cacheResult) { return cacheResult }

    const configs = await this.fetchClientSecretFromKeycloak(realm, client)
    configCache.set(cacheKey, configs)
    return configs
  }

  async fetchClientSecretFromKeycloak (realm, oauthClient) {
    const client = await KeycloakAdminClient()

    const result = await client.clients.getClientSecret(realm, oauthClient)

    return result
  }
}
