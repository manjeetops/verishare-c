import Responder from '../../../../server/expressResponder';
import UploadDocument from '../../../services/documents/uploadDocument';
import GetDocument from '../../../services/documents/getDocument';
import DownloadDocument from '../../../services/documents/downloadDocument';
import VerifySHA256 from '../../../services/documents/verifySha256';
import GetDocumentsList from '../../../services/documents/getDocumentsList';
import GetDocumentsByUserPermission from '../../../services/documents/getDocumentByUserPermission';
import GetDocumentOwnershipHistory from '../../../services/documents/getDocumentOwnershipHistory';
import TransferDocumentOwnership from '../../../services/documents/transferDocumentOwnership';
import ShareDocument from '../../../services/documents/shareDocument';
import DeleteDocument from '../../../services/documents/deleteDocument';
import UpdateDocumentDetails from '../../../services/documents/updateDocumentDetails';
import UpdateDocumentVersion from '../../../services/documents/updateDocumentVersion';
import { logAndThrowError } from '../../../utils/error';
import stream from 'stream'

export default class DocumentController {
  // Upload a document
  static async uploadDocument(req, res) {
    const user = req.adminUser || req.user;

    const [result, errors] = await UploadDocument.run({
      ...req.params,
      ...req.body,
      user,
      document: req.file,
      admin: !!req.adminUser
    });

    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error uploading the document ', errors, res);
    }
  }

  // Private route: Get document
  static async getDocument(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await GetDocument.run({
      ...req.params,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the document ', errors, res);
    }
  }

  //download document
  static async downloadDocument(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await DownloadDocument.run({
      ...req.params,
      user
    });
    if (result) {
      const filename = result.result.headers['filename'].split(' ').join('-')
      res.set('Content-Type', `appilcation/zip`)
      res.writeHead(200, {'Content-disposition': `attachment; filename=${filename}`})
      new stream.PassThrough().end(result.result.body).pipe(res)
    } else {
      logAndThrowError('Error fetching the document ', errors, res);
    }
  }

  // Private route: Get document ownership history
  static async getDocumentOwnershipHistory(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await GetDocumentOwnershipHistory.run({
      ...req.query,
      ...req.params,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError(
        "Error fetching the document's ownership history ",
        errors,
        res
      );
    }
  }

  // Protected route: get documents list
  static async getDocumentsList(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await GetDocumentsList.run({
      ...req.query,
      ...req.params,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the documents list ', errors, res);
    }
  }

  // Protected route: get documents list
  static async getDocumentsByUserPermission(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await GetDocumentsByUserPermission.run({
      ...req.query,
      ...req.params,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the documents list ', errors, res);
    }
  }

  // Public route: VerifySHA256
  static async verifySHA256(req, res) {
    const [result, errors] = await VerifySHA256.run({
      ...req.body,
      document: req.file
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error verification failed', errors, res);
    }
  }

  // Transfer document ownership
  static async transferDocumentOwnership(req, res) {
    const { userId: newOwnerId } = req.body;
    const user = req.adminUser || req.user;
    const data = {
      ...req.params,
      newOwnerId,
      user
    };
    const [result, errors] = await TransferDocumentOwnership.run(data);
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error while transferring the document ', errors, res);
    }
  }

  // share document access
  static async shareDocument(req, res) {
    const user = req.adminUser || req.user;
    const data = {
      ...req.body,
      ...req.params,
      user
    };

    const [result, errors] = await ShareDocument.run(data);
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error while sharing the document ', errors, res);
    }
  }

  // Delete a document
  static async deleteDocument(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await DeleteDocument.run({
      ...req.params,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error deleting the document ', errors, res);
    }
  }

  // Update a document
  static async updateDocumentDetails(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await UpdateDocumentDetails.run({
      ...req.params,
      ...req.body,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error updating the document ', errors, res);
    }
  }

  static async updateDocumentVersion(req, res) {
    const user = req.adminUser || req.user;
    const [result, errors] = await UpdateDocumentVersion.run({
      ...req.params,
      ...req.body,
      document: req.file,
      user
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error updating the document version', errors, res);
    }
  }
}
