import config from './app'

const { username, password, baseUrl } = config.get('keycloak')
const KeyCloakSettings = {
  username,
  password,
  baseUrl: `${baseUrl}/auth`,
  grant_type: 'password',
  client_id: 'admin-cli'
}

export default KeyCloakSettings
