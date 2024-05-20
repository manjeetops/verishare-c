import ConnectSequence from 'connect-sequence'

const keycloakProtect = (spec) => {
  return async (req, res, next) => {
    const keycloakInstance = req['keycloak_instance']
    const seq = new ConnectSequence(req, res, next)
    seq.append(keycloakInstance.protect(spec)).run()
  }
}

export default keycloakProtect
