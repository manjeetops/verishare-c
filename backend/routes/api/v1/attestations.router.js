import express from 'express'
import attestationController from '../../../app/controllers/api/v1/attestations.controller'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'

const args = { mergeParams: true }
const attestationProtectedRouter = express.Router(args)

attestationProtectedRouter.route('/documents/:document_id/attestations')
  .get(keycloakProtect(), attestationController.getDocumentAttestations)

attestationProtectedRouter.route('/documents/:document_id/attestations')
  .post(keycloakProtect(), attestationController.attestDocument)

export { attestationProtectedRouter }
