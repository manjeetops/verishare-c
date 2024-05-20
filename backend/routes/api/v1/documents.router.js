import multer from 'multer'
import express from 'express'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'
import documentController from '../../../app/controllers/api/v1/documents.controller'
import { validateUser } from '../../../app/middlewares/validateUser'

const multerUpload = multer()
const args = { mergeParams: true }
const documentProtectedRouter = express.Router(args)
const documentPublicRouter = express.Router(args)

documentPublicRouter.route('/documents/verify-sha256')
  .post(multerUpload.single('document'), documentController.verifySHA256)

documentProtectedRouter.route('/documents')
 .post(keycloakProtect(), validateUser, multerUpload.single('document'), documentController.uploadDocument)

documentProtectedRouter.route('/documents')
 .get(keycloakProtect(), validateUser, documentController.getDocumentsList)

documentProtectedRouter.route('/documents-permission')
 .get(keycloakProtect(), validateUser, documentController.getDocumentsByUserPermission)

documentProtectedRouter.route('/documents/:document_id')
 .get(keycloakProtect(), validateUser, documentController.getDocument)

documentProtectedRouter.route('/documents/:document_id/download')
 .get(keycloakProtect(), validateUser, documentController.downloadDocument)

documentProtectedRouter.route('/documents/:document_id')
 .delete(keycloakProtect(), validateUser, documentController.deleteDocument)

documentProtectedRouter.route('/documents/:document_id/details')
 .put(keycloakProtect(), validateUser, documentController.updateDocumentDetails)

documentProtectedRouter.route('/documents/:document_id/version')
 .put(keycloakProtect(), validateUser, multerUpload.single('document'), documentController.updateDocumentVersion)

documentProtectedRouter.route('/documents/:document_id/transfer')
 .post(keycloakProtect(), validateUser, documentController.transferDocumentOwnership)

documentProtectedRouter.route('/documents/:document_id/share')
 .post(keycloakProtect(), validateUser, documentController.shareDocument)

documentProtectedRouter.route('/documents/:document_id/ownership-history')
 .get(keycloakProtect(), validateUser, documentController.getDocumentOwnershipHistory)

export { documentProtectedRouter, documentPublicRouter }
