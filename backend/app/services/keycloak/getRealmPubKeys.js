import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import { nonEmptyString } from '../../helpers/validationConstraints'
import rp from 'request-promise'
import MemoryCache from '../../utils/memoryCache'
import config from '../../../config/app'
import jwkToPem from 'jwk-to-pem'

const keysCache = new MemoryCache(5)
const keycloakEndpoint = config.get('keycloak.internal_base_url')

const schema = {
  orgRealm: nonEmptyString,
  kid: { optional: true, type: 'string' }
}

export default class GetRealmPubKeys extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ orgRealm, kid }, ctx) {
    const keys = await this.fetchKeysForRealm(orgRealm)
    if (keys && kid) {
      const key = this.findKid(keys, kid)
      return key
    } else {
      return keys
    }
  }

  async fetchKeysForRealm (orgRealm) {
    let keys = await keysCache.get(orgRealm)
    if (keys) {
      return keys
    }

    keys = await this.fetchKeysFromKeycloak(orgRealm)
    const toPemKeys = keys.map((key) => ({ kid: key.kid, pem: jwkToPem(key) }))
    await keysCache.set(orgRealm, toPemKeys)
    return toPemKeys
  }

  findKid (keys, kid) {
    return keys.find((key) => key.kid == kid)
  }

  async fetchKeysFromKeycloak (orgRealm) {
    const url = `${keycloakEndpoint}/auth/realms/${orgRealm}/protocol/openid-connect/certs`
    const response = await rp(url)
    return JSON.parse(response)['keys']
  }
}
