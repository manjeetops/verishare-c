import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import of from 'await-of';
import DocumentAPIs from '../utils/documents';
import UserAPIs from '../utils/user';
import { dbStatus } from '../utils/status';
import CheckHelper from '../helpers/checkHelper';
import { INVITATION_TEST_DATA, documentTestData } from '../testData';

const TIME_STAMP = new Date().getTime();
const MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages';

let loginAdminAPIResponse;
let userSignUpTwoAPIResponse;
let userSignUpOneAPIResponse;
let loginUserTwoAPIResponse;
let loginUserOneAPIResponse;
let userSignUpThreeAPIResponse;
let loginUserThreeAPIResponse;
let uploadDocumentOneAPIResponse;
let uploadDocumentTwoAPIResponse;
let uploadDocumentThreeAPIResponse;

jest.setTimeout(50000);

const URL = `http://localhost:3000/api/v1`;

describe('Attestation Tests Started', () => {
  beforeAll(async () => {
    const username = 'admin@deqode.com';
    const password = 'string';
    const [response, err] = await of(UserAPIs.login({ username, password, URL }));
    loginAdminAPIResponse = response
    CheckHelper.checkResponseType(loginAdminAPIResponse);
    CheckHelper.checkToken(loginAdminAPIResponse);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const invitationData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    invitationData.email = `user-test-employee-one-${TIME_STAMP}@gmail.com`;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const [response, err] = await of(UserAPIs.createUser({
      accessToken,
      invitationData,
      URL, 
      mailhogUrl: MAILHOG_URL
    }));
    loginUserOneAPIResponse = response[0];
    userSignUpOneAPIResponse = response[1];
    CheckHelper.checkResponseType(loginUserOneAPIResponse);
    CheckHelper.checkResponseType(userSignUpOneAPIResponse);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const invitationData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    invitationData.email = `user-test-employee-two-${TIME_STAMP}@gmail.com`;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const [response, err] = await of(UserAPIs.createUser({
      accessToken,
      invitationData,
      URL,
      mailhogUrl: MAILHOG_URL
    }));
    loginUserTwoAPIResponse = response[0];
    userSignUpTwoAPIResponse = response[1];
    CheckHelper.checkResponseType(loginUserTwoAPIResponse);
    CheckHelper.checkResponseType(userSignUpTwoAPIResponse);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const invitationData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    invitationData.email = `user-test-employee-three-${TIME_STAMP}@gmail.com`;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const [response, err] = await of(UserAPIs.createUser({
      accessToken,
      invitationData,
      URL,
      mailhogUrl: MAILHOG_URL
    }));
    loginUserThreeAPIResponse = response[0];
    userSignUpThreeAPIResponse = response[1];
    CheckHelper.checkResponseType(loginUserThreeAPIResponse);
    CheckHelper.checkResponseType(userSignUpThreeAPIResponse);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    const [response, err] = await of(DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    }));
    uploadDocumentOneAPIResponse = response
    CheckHelper.checkResponseType(uploadDocumentOneAPIResponse);
    expect(err).toBe(undefined)
    const [getDocumentResponse, err1] = await of(dbStatus('getDocument', {
      userId,
      accessToken,
      documentId: uploadDocumentOneAPIResponse.result.documentId,
      URL
    }));
    CheckHelper.checkResponseType(getDocumentResponse);
    expect(err1).toBe(undefined)
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    const [response, err] = await of(DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    }));
    uploadDocumentTwoAPIResponse = response
    CheckHelper.checkResponseType(uploadDocumentTwoAPIResponse);
    expect(err).toBe(undefined)
    const [getDocumentResponse, err1] = await of(dbStatus('getDocument', {
      userId,
      accessToken,
      documentId: uploadDocumentTwoAPIResponse.result.documentId,
      URL
    }));
    CheckHelper.checkResponseType(getDocumentResponse);
    expect(err1).toBe(undefined)
  });

  beforeAll(async () => {
    const userId = userSignUpTwoAPIResponse.result.id;
    const accessToken = loginUserTwoAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    const [response, err] = await of(DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    }));
    uploadDocumentThreeAPIResponse = response
    CheckHelper.checkResponseType(uploadDocumentThreeAPIResponse);
    expect(err).toBe(undefined)

    const [getDocumentResponse, err1] = await of(dbStatus('getDocument', {
      userId,
      accessToken,
      documentId: uploadDocumentThreeAPIResponse.result.documentId,
      URL
    }));
    CheckHelper.checkResponseType(getDocumentResponse);
    expect(err1).toBe(undefined)
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const receiverId = userSignUpTwoAPIResponse.result.id;
    const accessType = 'VIEW';
    const accessScope = 'USER'
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const documentId = uploadDocumentOneAPIResponse.result.documentId;
    const [response, err] = await of(DocumentAPIs.shareDocument({
      userId,
      receiverId,
      accessScope,
      accessType,
      accessToken,
      documentId,
      URL
    }));
    CheckHelper.checkResponseType(response);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const documentId = uploadDocumentTwoAPIResponse.result.documentId;
    const [response, err] = await of(DocumentAPIs.deleteDocument({
      userId,
      accessToken,
      documentId,
      URL
    }));
    CheckHelper.checkResponseType(response);
    expect(err).toBe(undefined)
  });

  beforeAll(async () => {
    const status = true;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const documentId = uploadDocumentThreeAPIResponse.result.documentId;
    const [response, err] = await of(DocumentAPIs.freezeDocument({
      status,
      accessToken,
      documentId,
      URL
    }));
    CheckHelper.checkResponseType(response);
    expect(err).toBe(undefined)
  });

  describe('Document Attestation Test', () => {

    it('Document owner can attest the document with correct path', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const version = 1;
      const [attestDocumentAPIResponse, err] = await of(DocumentAPIs.attestDocument({
        accessToken,
        documentId,
        version,
        URL
      }));
      CheckHelper.checkResponseType(attestDocumentAPIResponse);
      CheckHelper.checkMessage(
        'attestMsg',
        attestDocumentAPIResponse.metaData.message
      );
      expect(err).toBe(undefined)
      expect(attestDocumentAPIResponse.result).toBeDefined();

      const [response, err1] = await of(dbStatus('getAttestation', {
        accessToken,
        documentId,
        URL
      }, {userId, version}));
      const attestation = _.find(response.result.attestations, [
        'userId',
        userId
      ]);
      expect(attestation.version).toBe(version)
      expect(err1).toBe(undefined)
    });

    it('User with document access can attest the document with correct path', async () => {
      const userId = userSignUpTwoAPIResponse.result.id;
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const version = 1;
      const [attestDocumentAPIResponse, err] = await of(DocumentAPIs.attestDocument({
        accessToken,
        documentId,
        version,
        URL
      }));
      CheckHelper.checkResponseType(attestDocumentAPIResponse);
      CheckHelper.checkMessage(
        'attestMsg',
        attestDocumentAPIResponse.metaData.message
      );
      expect(err).toBe(undefined)
      expect(attestDocumentAPIResponse.result).toBeDefined();

      const [response, err1] = await of(dbStatus('getAttestation', {
        accessToken,
        documentId,
        URL
      }, {userId, version}));
      const attestation = _.find(response.result.attestations, [
        'userId',
        userId
      ]);
      expect(attestation.version).toBe(version)
      expect(err1).toBe(undefined)
    });

    it('Document should not be attested if document is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uuidv4();
      const version = 1;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be attested if version id is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const version = 0;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be attested if document is deleted', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentTwoAPIResponse.result.documentId;
      const version = 1;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be attested if document is frozen', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const documentId = uploadDocumentThreeAPIResponse.result.documentId;
      const version = 1;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be attested if this attestation already exists', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const version = 1;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be attested if user does not have permission', async () => {
      const accessToken = loginUserThreeAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const version = 1;
      const [response, err] = await of(
        DocumentAPIs.attestDocument({
          accessToken,
          documentId,
          version,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Admin should be able to view anyones attestation', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const [response, err] = await of(DocumentAPIs.getAttestations({
        accessToken,
        documentId,
        URL
      }));
      CheckHelper.checkResponseType(response);
      expect(err).toBe(undefined)
    });

    it('User should be able to view the attestations of the document that he has access to', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const [response, err] = await of(DocumentAPIs.getAttestations({
        accessToken,
        documentId,
        URL
      }));
      CheckHelper.checkResponseType(response);
      expect(err).toBe(undefined)
    });

    it('User should not be able to view attestations of the document with no access', async () => {
      const accessToken = loginUserThreeAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.documentId;
      const [response, err] = await of(
        DocumentAPIs.getAttestations({
          accessToken,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });
  });
});
