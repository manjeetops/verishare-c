import Responder from '../../../../server/expressResponder';
import GetDocumentAttestations from '../../../services/attestations/getDocumentAttestations';
import AttestDocument from '../../../services/attestations/attestDocument';
import { logAndThrowError } from '../../../utils/error';

export default class AttestationController {

  static async getDocumentAttestations(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [result, errors] = await GetDocumentAttestations.run({
      ...req.params,
      keycloakSubId
    });
    
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the Attestations list:', errors, res);
    }
  }

  static async attestDocument(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [result, errors] = await AttestDocument.run({
      ...req.params,
      ...req.body,
      keycloakSubId
    });

    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error while attesting a document ', errors, res);
    }
  }
}
