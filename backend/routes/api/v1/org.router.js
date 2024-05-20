import express from 'express'
import orgController from '../../../app/controllers/api/v1/org.controller'
import keyclockOrgSelector from '../../../app/middlewares/keyclockOrgSelector'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'
import config from '../../../config/app'
const { admin } = config.get('org_roles')

const args = { mergeParams: true }
const orgSuperAdminRouter = express.Router(args)
const orgPublicRouter = express.Router(args)
const orgRouter = express.Router(args)

orgSuperAdminRouter.route('/').post(orgController.CreateOrgInBlockchain)
orgSuperAdminRouter.route('/:organization_id/update-status').put(orgController.updateOrgStatus)

// accessible by super admin and organization-admin
orgRouter.route('/organizations/:organization_id/users').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  orgController.getOrganizationUsers
)

orgRouter.route('/users').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  orgController.getAllUsers
)

orgRouter.route('/organizations').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  orgController.getOrgList
)

orgRouter.route('/organizations/:organization_id').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  orgController.getOrgInfo
)

orgRouter.route('/organizations/:organization_id/documents').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  orgController.getAllDocuments
)

orgRouter.route('/documents/:document_id/freeze').put(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  orgController.freezeDocument
)

orgRouter.route('/users/:user_id').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  orgController.getUser
)

// accessible by organization-admin
orgRouter.route('/users/:user_id/update-status').put(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  orgController.updateUserStatus
)

export { orgSuperAdminRouter, orgRouter, orgPublicRouter }
