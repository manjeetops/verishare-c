import ActionBase from '../../utils/actionBase'
import { argumentsValidator } from '../../utils/decorators/argumentsValidator'
import { nonEmptyString } from '../../helpers/validationConstraints'
import GetRealmPubKeys from './getRealmPubKeys'
import crypto from 'crypto'
import Token from './token'
import config from '../../../config/app'
import logger from '../../../server/logger';

const { baseUrl } = config.get('keycloak')

const schema = {
  orgRealm: nonEmptyString,
  accessToken: nonEmptyString
}

export default class ValidateAccessToken extends ActionBase {
  @argumentsValidator(schema)
  async perform ({ orgRealm, accessToken }, ctx) {
    const token = new Token(accessToken, orgRealm)
    const err = this.checkToken(token, orgRealm)
    if (err) {
      ctx.logger.error('invalidToken', err)
      throw new Error('Token invalid')
    }

    const [key, errs] = await GetRealmPubKeys.run({ orgRealm, kid: token.header.kid })
    if (errs) {
      ctx.logger.error('Error getting realm public keys:', err)
      throw new Error('Error getting realm public keys')
    }

    const isValidSignature = this.isSignatureValid(token, key)
    if (!isValidSignature) {
      throw new Error('invalidToken: Access token is invalid')
    }

    return token.content
  }

  checkToken (token, realmName) {
    let err
    if (token.isExpired()) {
      err = 'invalid token (expired)'
    } else if (!token.signed) {
      err = 'invalid token (not signed)'
    } else if (token.content.iss !== `${baseUrl}/auth/realms/${realmName}`) {
      err = 'invalid token (wrong ISS)'
    }
    return err
  }

  isSignatureValid (token, key) {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(token.signed)
    return verify.verify(key.pem, token.signature)
  }
}
