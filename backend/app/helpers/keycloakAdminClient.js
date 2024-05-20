import AdminClient from 'keycloak-admin-client'
import KeycloakSettings from '../../config/keycloak'

const getKeycloakAdminClient = async (accessToken) => {
  const client = await AdminClient({ ...KeycloakSettings, accessToken })
  return client
}

export default getKeycloakAdminClient
