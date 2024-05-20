import _ from 'lodash';
import DocumentAPIs from '../utils/documents';
import InvitationAPIs from '../utils/invitation';
import UserAPIs from '../utils/user';
import { sleep } from '../utils/sleep';
import of from 'await-of';

export async function dbStatus(query, params, prevResponse) {
  const startTime = Date.now();
  let response, err;
  while (true) {
    if (Date.now() - startTime > 20000) {
      console.log(err);
      break;
    }
    await sleep(200);
    if (query === 'getDocument') {
      [response, err] = await of(DocumentAPIs.getDocument(params));
    } else if (query === 'getAttestation') {
      [response, err] = await of(DocumentAPIs.getAttestations(params));
      if (err) {
        return [response, err];
      }
      const attestation = _.find(response.result.attestations, [
        'userId',
        prevResponse.userId
      ]);
      if (
        attestation === undefined ||
        attestation.version != prevResponse.version
      ) {
        continue;
      }
    } else if (query === 'getUser') {
      [response, err] = await of(UserAPIs.getUserDetails(params));
    } else if (query === 'getInvitation') {
      [response, err] = await of(InvitationAPIs.getInvitation(params));
    } else if (query === 'getVersion') {
      [response, err] = await of(DocumentAPIs.getDocument(params));
      if (
        response.result.version != prevResponse.result.version ||
        response.result.versions.length != prevResponse.result.version
      ) {
        continue;
      }
    } else if (query === 'getUpdatedDocument') {
      [response, err] = await of(DocumentAPIs.getDocument(params));
      if (response.result.name != prevResponse.name) {
        continue;
      }
    } else if (query === 'getUpdatedStatusDocument') {
      [response, err] = await of(DocumentAPIs.getDocument(params));
      if (response.result.frozen != prevResponse) {
        continue;
      }
    } else if (query === 'deleteDocument') {
      [response, err] = await of(DocumentAPIs.getDocument(params));
      if (err) {
        return [response, err];
      } else {
        continue;
      }
    }

    // console.log(response);

    if (!err) {
      return response;
    }
  }
}
