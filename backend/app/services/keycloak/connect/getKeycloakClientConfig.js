import ActionBase from '../../../utils/actionBase'
import { argumentsValidator } from '../../../utils/decorators/argumentsValidator'
import MemoryCache from '../../../utils/memoryCache'
import GetKeycloakAdminClient from '../admin/GetKeycloakAdminClient'
import GetRealmClients from '../getRealmClients'
import GetClientSecretByClientId from '../getClientSecretByClientId'
import config from '../../../../config/app'
import { log } from '../../../utils/decorators/log'

const { internal_base_url } = config.get('keycloak')
// one hour TTL value
const configCache = new MemoryCache(60 * 60 * 1)

const schema = {
  realm: { type: 'string' },
  client: { type: 'string' }
}

/***
 * We're storing client_secret and realm_client info in cache.
 * REALM_CLIENT_CACHE_KEY which store the respective client id in cache. ex {id: 'xxx-xxx', clientId: 'client_name'}
 * CLIENT_CONFIG_CACHE_KEY which store the respective client secret in cache. ex {type: 'secret', value: 'secret_key'}
 */

@log
export default class GetKeycloakClientConfig extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ realm, client }, ctx) {
    // var declaration
    const REALM_CLIENT_CACHE_KEY = `${realm}_client_${client}`
    let filteredClient = await this.getClientsFromCache(REALM_CLIENT_CACHE_KEY)
    let clientFoundInCache = false
    let keycloakAdminClient

    // If client exist in cache
    if (filteredClient) {
      clientFoundInCache = this.isClientIdFound(filteredClient)
    }

    // If client not found in cache
    if (!clientFoundInCache) {
      const keycloakAdminClient1 = await GetKeycloakAdminClient.perform({}, ctx)

      keycloakAdminClient = keycloakAdminClient1
      const apiClient = await this.getRealmClientFromAPI(realm, keycloakAdminClient, client, REALM_CLIENT_CACHE_KEY, ctx)

      // In case user forget to add client 'react' in the organization on keycloak manually
      if (!apiClient) {
        throw new Error('invalidClient: Need to add react client manually on keycloak')
      }
      filteredClient = apiClient
    }

    // Find clientId of respective client
    if (!(filteredClient && filteredClient['id'])) {
      throw new Error('clientData: invalid Client')
    }

    const CLIENT_CONFIG_CACHE_KEY = `${realm}__config__${client}`
    // If client secret present in cache
    const clientConfig = configCache.get(CLIENT_CONFIG_CACHE_KEY)
    if (clientConfig) {
      return clientConfig
    }

    // If client secret not found in cache
    if (!keycloakAdminClient) {
      const keycloakAdminClient2 = await GetKeycloakAdminClient.perform({}, ctx)
      keycloakAdminClient = keycloakAdminClient2
    }

    // Find client secret by client Id
    const response = await GetClientSecretByClientId.perform({
      realm,
      keycloakAdminClient,
      clientId: filteredClient['id']
    }, ctx)

    if (!(response && response['value'])) {
      throw new Error('secretKey: invalid client secret')
    }

    return this.getClientConfig(realm, client, response['value'], CLIENT_CONFIG_CACHE_KEY)
  }

  getClientId (clients, client) {
    return clients.find((data) => data['clientId'] === client)
  }

  isClientIdFound (clientData) {
    return (clientData && clientData['id'])
  }

  async getClientsFromCache (realmClientCacheKey) {
    return configCache.get(realmClientCacheKey)
  }

  async getRealmClientFromAPI (realm, keycloakAdminClient, client, realmClientCacheKey, ctx) {
    const clientsData = await GetRealmClients.perform({ realm, keycloakAdminClient }, ctx)
    let filteredClient
    if (clientsData) {
      filteredClient = this.getClientId(clientsData, client)
      if ((filteredClient && filteredClient['id'])) {
        configCache.set(
          realmClientCacheKey,
          { id: filteredClient['id'], clientId: filteredClient['clientId'] }
        )
      }
    }
    return filteredClient
  }

  async getClientConfig (realm, client, secret, clientConfigCacheKey) {
    const config = {
      'realm': realm,
      'auth-server-url': `${internal_base_url}/auth`,
      'ssl-required': 'external',
      'resource': client,
      'credentials': {
        'secret': secret
      },
      'confidential-port': 0,
      'policy-enforcer': {}
    }
    configCache.set(clientConfigCacheKey, config)
    return config
  }
}
