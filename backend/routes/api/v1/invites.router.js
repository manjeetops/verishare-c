import express from 'express'
import invitesController from '../../../app/controllers/api/v1/invites.controller'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'
import keyclockOrgSelector from '../../../app/middlewares/keyclockOrgSelector'

import config from '../../../config/app'
const { admin } = config.get('org_roles')

const invitesRouter = express.Router({ mergeParams: true })

// Public routes
invitesRouter.route('/invites/:invitation_code')
  .get(invitesController.getInvitationDetails)

// Protected routes
invitesRouter.route('/invites').post(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  invitesController.invite
)

invitesRouter.route('/invites').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  invitesController.getInvites
)

invitesRouter.route('/invites/:invitation_id').delete(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  invitesController.deleteInvitation
)

invitesRouter.route('/invites/:invitation_id').put(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(`realm:${admin}`),
  invitesController.updateInvitation
)

export default invitesRouter
