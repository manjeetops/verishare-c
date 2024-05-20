import AuthorizeToken from '../services/keycloak/authorizeToken'

const authorizeToken = (scope, resource) => {
  return async (req, res, next) => {
    const { headers, params } = req
    const auth = headers['authorization']
    const bearerToken = auth && auth.replace('Bearer ', '')
    const [, err] = await AuthorizeToken.run({
      token: bearerToken,
      realmName: params['org_name'],
      clientId: 'react',
      scope,
      resource
    })

    if (err) {
      return res.boom.badRequest(err)
    }
    next()
  }
}

export { authorizeToken }
