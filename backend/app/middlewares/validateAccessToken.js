import ValidateAccessToken from '../services/keycloak/validateAccessToken'
import { Responder } from '../../server'

const validateAccessToken = async (req, res, next) => {
  const { headers, params } = req
  const auth = headers['authorization']
  const bearerToken = auth && auth.replace('Bearer ', '')

  if (!bearerToken) {
    return res.boom.badRequest('Token not found')
  }

  const [tokenPayload, err] = await ValidateAccessToken.run({
    accessToken: bearerToken,
    orgRealm: params['org_name']
  })

  if (err) {
    return Responder.operationFailed(res, err)
  }

  req.auth = tokenPayload

  // Do not block the request now, as this should be a task of authorization
  // This is just authentication middleware

  next()
}

export { validateAccessToken }
