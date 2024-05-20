import Keycloak from 'keycloak-connect'
import GrantManager from 'keycloak-connect/middleware/auth-utils/grant-manager'
import Setup from 'keycloak-connect/middleware/setup'
import GrantAttacher from 'keycloak-connect/middleware/grant-attacher'
import crypto from 'crypto'
import config from '../../config/app'

const { base_url: baseURL } = config.get('keycloak')

Keycloak.prototype.loginUrl = function (uuid, redirectUrl, realmUrlOverride) {
  var urlBase = realmUrlOverride || this.config.realmUrl
  var url = urlBase +
    '/protocol/openid-connect/auth' +
    '?client_id=' + encodeURIComponent(this.config.clientId) +
    '&state=' + encodeURIComponent(uuid) +
    '&redirect_uri=' + encodeURIComponent(redirectUrl) +
    '&scope=' + encodeURIComponent(this.config.scope ? 'openid ' + this.config.scope : 'openid') +
    '&response_type=code'

  if (this.config && this.config.idpHint) {
    url += '&kc_idp_hint=' + encodeURIComponent(this.config.idpHint)
  }

  return url
}

Keycloak.prototype.getGrant = function (request, response) {
  var rawData

  for (var i = 0; i < this.stores.length; ++i) {
    rawData = this.stores[i].get(request)
    if (rawData) {
      // store = this.stores[i];
      break
    }
  }

  var grantData = rawData
  if (typeof (grantData) === 'string') {
    grantData = JSON.parse(grantData)
  }

  if (grantData && !grantData.error) {
    var self = this
    return this.grantManager.createGrant(JSON.stringify(grantData))
      .then(grant => {
        self.storeGrant(grant, request, response)
        return grant
      })
      .catch(() => { return Promise.reject() })
  }

  return Promise.reject()
}

Keycloak.prototype.logoutUrl = function (url, redirectUrl) {
  return url +
    '/protocol/openid-connect/logout' +
    '?redirect_uri=' + encodeURIComponent(redirectUrl)
}

Keycloak.prototype.redirectToLogin = function (request) {
  return false
}

// Modified Logout keycloak middleware
const ModifiedLogout = function (keycloak, logoutUrl) {
  return function logout (request, response, next) {
    console.log('request.kauth.grant ', request.kauth.grant)
    if (request.kauth.grant) {
      request.session = null
      const url = `${baseURL}/auth/realms/${keycloak.config.realm}`
      const keycloakLogoutUrl = keycloak.logoutUrl(url, baseURL)
      return response.redirect(keycloakLogoutUrl)
    } else {
      request.logoutStatus = false
    }
    next()
  }
}

// Modified PostAuth Keycloak Middleware
const ModifiedPostAuth = function (keycloak) {
  return function postAuth (request, response, next) {
    if (!request.query.auth_callback) {
      return next()
    }

    if (request.query.error) {
      return keycloak.accessDenied(request, response, next)
    }

    keycloak.getGrantFromCode(request.query.code, request, response)
      .then(grant => {
        request.kauth.grant = grant
        try {
          keycloak.authenticated(request)
        } catch (err) {
          console.log(err)
        }
        response.redirect(`${request.baseUrl}/callback`)
      }).catch((err) => {
        keycloak.accessDenied(request, response, next)
        console.error('Could not obtain grant code: ' + err)
      })
  }
}

// overwrite the middleware method
Keycloak.prototype.middleware = function (options, middlewareType) {
  if (!options) {
    options = { logout: '', admin: '' }
  }

  options.logout = options.logout || '/logout'
  options.admin = options.admin || '/'

  const middlewares = []
  // Default selected middleware setup
  middlewares.push(Setup)

  if (middlewareType === 'GRANT') {
    middlewares.push(ModifiedPostAuth(this))
  }

  if (['GRANT', 'GRANT_ATTACHER', 'LOGOUT'].includes(middlewareType)) {
    middlewares.push(GrantAttacher(this))
  }

  if (middlewareType === 'LOGOUT') {
    middlewares.push(ModifiedLogout(this, options.logout))
  }
  // TODO: need to discuss
  // middlewares.push(Admin(this, options.admin))

  return middlewares
}

// overwrite the validateToken method
GrantManager.prototype.validateToken = function validateToken (token, expectedType) {
  // let realmName = this.realmUrl.split('/')[5]
  // const url = `${baseURL}/auth/realms/${realmName}`
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('invalid token (missing)'))
    } else if (token.isExpired()) {
      reject(new Error('invalid token (expired)'))
    } else if (!token.signed) {
      reject(new Error('invalid token (not signed)'))
    } else if (token.content.typ !== expectedType) {
      reject(new Error('invalid token (wrong type)'))
    } else if (token.content.iat < this.notBefore) {
      reject(new Error('invalid token (future dated)'))
    } else {
      const verify = crypto.createVerify('RSA-SHA256')
      // if public key has been supplied use it to validate token
      if (this.publicKey) {
        try {
          verify.update(token.signed)
          if (!verify.verify(this.publicKey, token.signature, 'base64')) {
            reject(new Error('invalid token (signature)'))
          } else {
            resolve(token)
          }
        } catch (err) {
          reject(new Error('Misconfigured parameters while validating token. Check your keycloak.json file!'))
        }
      } else {
        // retrieve public KEY and use it to validate token
        this.rotation.getJWK(token.header.kid).then(key => {
          verify.update(token.signed)
          if (!verify.verify(key, token.signature)) {
            reject(new Error('invalid token (public key signature)'))
          } else {
            resolve(token)
          }
        }).catch((err) => {
          reject(new Error('failed to load public key to verify token. Reason: ' + err.message))
        })
      }
    }
  })
}

export default Keycloak
