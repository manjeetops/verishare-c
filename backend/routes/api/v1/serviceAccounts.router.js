import express from 'express'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'
import serviceAccountsController from '../../../app/controllers/api/v1/serviceAccounts.controller'
import keyclockOrgSelector from '../../../app/middlewares/keyclockOrgSelector'
import config from '../../../config/app'

const { admin } = config.get('org_roles')

const serviceAccountsRouter = express.Router({ mergeParams: true })

// Service accounts routes
serviceAccountsRouter.route('/service-accounts').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  serviceAccountsController.getServiceAccounts
)

serviceAccountsRouter.route('/service-accounts/:service_account_id/credentials').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  serviceAccountsController.getServiceAccountCredential
)

export default serviceAccountsRouter
