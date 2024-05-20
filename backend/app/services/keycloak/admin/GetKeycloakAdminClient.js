import ActionBase from '../../../utils/actionBase'
import AdminClient from 'keycloak-admin-client'
import config from '../../../../config/app'
import of from 'await-of'
import { log } from '../../../utils/decorators/log';

const KeyCloakSettings = {
  username: config.get('keycloak.admin.username'),
  password: config.get('keycloak.admin.password'),
  baseUrl: `${config.get('keycloak.internal_base_url')}/auth`,
  grant_type: 'password',
  client_id: 'admin-cli'
}

@log
export default class GetKeycloakAdminClientService extends ActionBase {
  async perform (reqData, ctx) {
    const [keycloakAdminClient, err] = await of(AdminClient({ ...KeyCloakSettings }))
    if (err) {
      ctx.logger.error('KeycloakLoginError:', err)
      throw new Error('Error logging in keycloak')
    }
    return keycloakAdminClient
  }
}
