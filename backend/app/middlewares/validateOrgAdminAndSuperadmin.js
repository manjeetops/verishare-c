import ConnectSequence from 'connect-sequence'
import keyclockOrgSelector from './keyclockOrgSelector'
import keycloakProtect from './keycloakProtect'
import { authenticateUser } from '../auth_stratagies/authenticateUser'
import config from '../../config/app'
const { admin } = config.get('org_roles')

const TOKEN_TYPES = ['Basic', 'basic', 'Bearer', 'bearer']

const validateOrgAdminAndSuperAdmin = (req, res, next) => {
  const seq = new ConnectSequence(req, res, next)
  const { headers } = req
  const auth = headers['authorization']
  if (!auth) {
    return res.boom.notFound('Authorization header not found')
  }
  const [tokenType, tokenValue] = auth.split(' ')
  if (!(TOKEN_TYPES.includes(tokenType) && tokenValue)) {
    return res.boom.notFound('Token not found')
  }
  let middlewares
  if (tokenType === 'bearer' || tokenType === 'Bearer') {
    middlewares = [
      keyclockOrgSelector('GRANT_ATTACHER'),
      keycloakProtect(`realm:${admin}`)
    ]
  } else {
    middlewares = [authenticateUser]
  }
  seq.append(...middlewares).run()
}

export default validateOrgAdminAndSuperAdmin
