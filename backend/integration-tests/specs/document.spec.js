import uuidv4 from 'uuid/v4';
import of from 'await-of';
import UserAPIs from '../utils/user';
import CheckHelper from '../helpers/checkHelper';
import DocumentAPIs from '../utils/documents';
import { dbStatus } from '../utils/status';

import {
  INVITATION_TEST_DATA,
  UPDATE_DOCUMENT_TEST_DATA,
  documentTestData,
  versionUpdateTestData
} from '../testData';

jest.setTimeout(50000);

const TIME_STAMP = new Date().getTime();
const URL = `http://localhost:3000/api/v1`;
const MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages';

let loginAdminAPIResponse;
let loginUserOneAPIResponse;
let loginUserTwoAPIResponse;
let userSignUpOneAPIResponse;
let userSignUpTwoAPIResponse;
let uploadDocumentOneAPIResponse;
let uploadDocumentTwoAPIResponse;
let uploadDocumentThreeAPIResponse;
let uploadDocumentFourAPIResponse;
let uploadDocumentFiveAPIResponse;
let adminInfoAPIResponse;

describe('Document Test Started', () => {
  beforeAll(async () => {
    const username = 'admin@deqode.com';
    const password = 'string';
    loginAdminAPIResponse = await UserAPIs.login({ username, password, URL });
    CheckHelper.checkResponseType(loginAdminAPIResponse);
    CheckHelper.checkToken(loginAdminAPIResponse);
  });

  beforeAll(async () => {
    const accessToken = loginAdminAPIResponse.result.access_token;
    adminInfoAPIResponse = await UserAPIs.getAdminInfo({ accessToken, URL });
    CheckHelper.checkResponseType(adminInfoAPIResponse);
  });

  beforeAll(async () => {
    const invitationData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    invitationData.email = `user-test-employee-one-${TIME_STAMP}@gmail.com`;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const response = await UserAPIs.createUser({
      accessToken,
      invitationData,
      URL,
      mailhogUrl: MAILHOG_URL
    });
    loginUserOneAPIResponse = response[0];
    userSignUpOneAPIResponse = response[1];
    CheckHelper.checkResponseType(loginUserOneAPIResponse);
    CheckHelper.checkResponseType(userSignUpOneAPIResponse);
  });

  beforeAll(async () => {
    const invitationData = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
    invitationData.email = `user-test-employee-two-${TIME_STAMP}@gmail.com`;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const response = await UserAPIs.createUser({
      accessToken,
      invitationData,
      URL,
      mailhogUrl: MAILHOG_URL
    });
    loginUserTwoAPIResponse = response[0];
    userSignUpTwoAPIResponse = response[1];
    CheckHelper.checkResponseType(loginUserTwoAPIResponse);
    CheckHelper.checkResponseType(userSignUpTwoAPIResponse);
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    uploadDocumentTwoAPIResponse = await DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    });
    CheckHelper.checkResponseType(uploadDocumentTwoAPIResponse);

    const documentId = uploadDocumentTwoAPIResponse.result.document.id;
    const response = await dbStatus('getDocument', {
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    uploadDocumentThreeAPIResponse = await DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    });

    CheckHelper.checkResponseType(uploadDocumentThreeAPIResponse);
    const documentId = uploadDocumentThreeAPIResponse.result.document.id;
    const response = await dbStatus('getDocument', {
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    uploadDocumentFourAPIResponse = await DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    });

    CheckHelper.checkResponseType(uploadDocumentFourAPIResponse);
    const documentId = uploadDocumentFourAPIResponse.result.document.id;
    const response = await dbStatus('getDocument', {
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);
  });

  beforeAll(async () => {
    const userId = userSignUpTwoAPIResponse.result.id;
    const accessToken = loginUserTwoAPIResponse.result.access_token;
    const formData = await documentTestData('false');
    uploadDocumentFiveAPIResponse = await DocumentAPIs.uploadDocument({
      userId,
      accessToken,
      formData,
      URL
    });

    CheckHelper.checkResponseType(uploadDocumentFiveAPIResponse);
    const documentId = uploadDocumentFiveAPIResponse.result.document.id;
    const response = await dbStatus('getDocument', {
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);
  });

  beforeAll(async () => {
    const userId = userSignUpOneAPIResponse.result.id;
    const accessToken = loginUserOneAPIResponse.result.access_token;
    const documentId = uploadDocumentTwoAPIResponse.result.document.id;
    const response = await DocumentAPIs.deleteDocument({
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);

    const [getDocumentResponse, err] = await dbStatus('deleteDocument', {
      userId,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkError(getDocumentResponse, err);
  });

  beforeAll(async () => {
    const status = true;
    const accessToken = loginAdminAPIResponse.result.access_token;
    const documentId = uploadDocumentThreeAPIResponse.result.document.id;
    const response = await DocumentAPIs.freezeDocument({
      status,
      accessToken,
      documentId,
      URL
    });
    CheckHelper.checkResponseType(response);
    const userId = userSignUpOneAPIResponse.result.id;
    const getDocumentResponse = await dbStatus(
      'getUpdatedStatusDocument',
      {
        userId,
        accessToken,
        documentId,
        URL
      },
      true
    );

    CheckHelper.checkResponseType(getDocumentResponse);
    expect(getDocumentResponse.result.frozen).toEqual(true);
  });

  describe('Document upload Test', () => {
    it('Document should be uploaded with correct path', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const formData = await documentTestData('false');
      uploadDocumentOneAPIResponse = await DocumentAPIs.uploadDocument({
        userId,
        accessToken,
        formData,
        URL
      });

      CheckHelper.checkResponseType(uploadDocumentOneAPIResponse);
      CheckHelper.checkMessage(
        'uploadDocumentMsg',
        uploadDocumentOneAPIResponse.metaData.message
      );

      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const response = await dbStatus('getDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('Only admin document can be frozen while uploading', async () => {
      const userId = adminInfoAPIResponse.result.user.account_id;
      const accessToken = loginAdminAPIResponse.result.access_token;
      const formData = await documentTestData('false');
      const uploadDocumentResponse = await DocumentAPIs.uploadDocument({
        userId,
        accessToken,
        formData,
        URL
      });

      CheckHelper.checkResponseType(uploadDocumentResponse);
      CheckHelper.checkMessage(
        'uploadDocumentMsg',
        uploadDocumentResponse.metaData.message
      );

      const documentId = uploadDocumentResponse.result.document.id;
      const getDocumentResponse = await dbStatus('getDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(getDocumentResponse);
    });

    it('Admin should be able to upload the document on behalf of user', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginAdminAPIResponse.result.access_token;
      const formData = await documentTestData('false');
      const uploadDocumentResponse = await DocumentAPIs.uploadDocument({
        userId,
        accessToken,
        formData,
        URL
      });

      CheckHelper.checkResponseType(uploadDocumentResponse);
      CheckHelper.checkMessage(
        'uploadDocumentMsg',
        uploadDocumentResponse.metaData.message
      );

      const documentId = uploadDocumentResponse.result.document.id;
      const getDocumentResponse = await dbStatus('getDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(getDocumentResponse);
    });

    it('Admin should be able to upload the document on behalf of user with frozen status true', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginAdminAPIResponse.result.access_token;
      const formData = await documentTestData('true');
      const uploadDocumentResponse = await DocumentAPIs.uploadDocument({
        userId,
        accessToken,
        formData,
        URL
      });

      CheckHelper.checkResponseType(uploadDocumentResponse);
      CheckHelper.checkMessage(
        'uploadDocumentMsg',
        uploadDocumentResponse.metaData.message
      );

      const documentId = uploadDocumentResponse.result.document.id;
      const getDocumentResponse = await dbStatus('getDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(getDocumentResponse);
    });

    it('User document should not frozen while uploading', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const formData = await documentTestData('true');
      const [response, err] = await of(
        DocumentAPIs.uploadDocument({
          userId,
          accessToken,
          formData,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it(`Admin should be able to view anyone's document details`, async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const response = await DocumentAPIs.getDocument({
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('User should be able to view their own document', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const response = await DocumentAPIs.getDocument({
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('No one should be able to view the document details if user-id is invalid', async () => {
      const userId = uuidv4();
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.getDocument({
          userId,
          accessToken,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('user should not be able to view the document of another user', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentFiveAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.getDocument({
          userId,
          accessToken,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('user should not be able to view the document if documentId is invalid', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uuidv4();
      const [response, err] = await of(
        DocumentAPIs.getDocument({
          userId,
          accessToken,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('User should not be able to see the document if document id field is empty', async () => {
      const userId = userSignUpOneAPIResponse.result.id;
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const [response, err] = await of(
        DocumentAPIs.getDocument({
          userId,
          accessToken,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Admin should be able to view  all the documents of an user of that organization', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const pageOffset = 10;
      const pageNumber = 1;
      const response = await DocumentAPIs.getDocumentsList({
        accessToken,
        userId,
        pageOffset,
        pageNumber,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('Admin should be able to view  all the documents of that organization', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const pageOffset = 10;
      const pageNumber = 1;
      const response = await DocumentAPIs.getAllDocuments({
        accessToken,
        pageOffset,
        pageNumber,
        URL
      });
      CheckHelper.checkResponseType(response);
    });
  });

  describe('Document version update Test', () => {
    it('Document version should be updated with correct path', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const response = await DocumentAPIs.updateVersion({
        formData,
        accessToken,
        userId,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getVersion',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        response
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.version).toEqual(
        response.result.version
      );
      expect(getDocumentResponse.result.versions.length).toEqual(
        response.result.version
      );
    });

    it('Document version should not be updated if document id is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uuidv4();
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const [response, err] = await of(
        DocumentAPIs.updateVersion({
          formData,
          accessToken,
          userId,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it(`Admin should be able to update document version on behalf of user`, async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const response = await DocumentAPIs.updateVersion({
        formData,
        accessToken,
        userId,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getVersion',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        response
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.version).toEqual(
        response.result.version
      );
      expect(getDocumentResponse.result.versions.length).toEqual(
        response.result.version
      );
    });

    it(`Admin should be able to update document versionon behalf of user even if document is frozen`, async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const response = await DocumentAPIs.updateVersion({
        formData,
        accessToken,
        userId,
        documentId,
        URL
      });
      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getVersion',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        response
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.version).toEqual(
        response.result.version
      );
      expect(getDocumentResponse.result.versions.length).toEqual(
        response.result.version
      );
    });

    it('Document version should not be updated if document is frozen', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const [response, err] = await of(
        DocumentAPIs.updateVersion({
          formData,
          accessToken,
          userId,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document version should not be updated if document is deleted', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentTwoAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const [response, err] = await of(
        DocumentAPIs.updateVersion({
          formData,
          accessToken,
          userId,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('User should not be able to Update version of another user document', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentFiveAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const formData = await versionUpdateTestData();
      const [response, err] = await of(
        DocumentAPIs.updateVersion({
          formData,
          accessToken,
          userId,
          documentId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });
  });

  describe('Document details update Test', () => {
    it('Document details should be updated with correct path', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const response = await DocumentAPIs.updateDocumentDetails({
        accessToken,
        documentId,
        userId,
        ...UPDATE_DOCUMENT_TEST_DATA,
        URL
      });

      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getUpdatedDocument',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        UPDATE_DOCUMENT_TEST_DATA
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.name).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.name
      );
      expect(getDocumentResponse.result.description).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.description
      );
      expect(getDocumentResponse.result.url).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.url
      );
    });

    it('Document details should not be updated if document id is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uuidv4();
      const userId = userSignUpOneAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.updateDocumentDetails({
          accessToken,
          documentId,
          userId,
          ...UPDATE_DOCUMENT_TEST_DATA,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it(`Admin should be able to update document details on the behalf of user`, async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const response = await DocumentAPIs.updateDocumentDetails({
        accessToken,
        documentId,
        userId,
        ...UPDATE_DOCUMENT_TEST_DATA,
        URL
      });

      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getUpdatedDocument',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        UPDATE_DOCUMENT_TEST_DATA
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.name).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.name
      );
      expect(getDocumentResponse.result.description).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.description
      );
      expect(getDocumentResponse.result.url).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.url
      );
    });

    it('Document details should not be updated if document is frozen', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.updateDocumentDetails({
          accessToken,
          documentId,
          userId,
          ...UPDATE_DOCUMENT_TEST_DATA,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Admin should be able to Update the document details even if document is frozen', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const response = await DocumentAPIs.updateDocumentDetails({
        accessToken,
        documentId,
        userId,
        ...UPDATE_DOCUMENT_TEST_DATA,
        URL
      });

      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus(
        'getUpdatedDocument',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        UPDATE_DOCUMENT_TEST_DATA
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.name).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.name
      );
      expect(getDocumentResponse.result.description).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.description
      );
      expect(getDocumentResponse.result.url).toEqual(
        UPDATE_DOCUMENT_TEST_DATA.url
      );
    });

    it('Document details should not be updated if document is deleted', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentTwoAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.updateDocumentDetails({
          accessToken,
          documentId,
          userId,
          ...UPDATE_DOCUMENT_TEST_DATA,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('user should not be able to update the document details of another user', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentFiveAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.updateDocumentDetails({
          accessToken,
          documentId,
          userId,
          ...UPDATE_DOCUMENT_TEST_DATA,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('user should not be able to update the document details if none of the fields of updated details are provided', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uploadDocumentFiveAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.updateDocumentDetails({
          accessToken,
          documentId,
          userId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });
  });

  describe('Transfer document Test', () => {
    it('Document should be transferred with correct path', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerId = userSignUpTwoAPIResponse.result.id;
      const response = await DocumentAPIs.transferDocument({
        accessToken,
        userId,
        documentId,
        newOwnerId,
        URL
      });

      CheckHelper.checkResponseType(response);

      const userTwoId = userSignUpTwoAPIResponse.result.id;
      const userTwoAccessToken = loginUserTwoAPIResponse.result.access_token;
      const getDocumentResponse = await dbStatus('getDocument', {
        userId: userTwoId,
        accessToken: userTwoAccessToken,
        documentId,
        URL
      });

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.owner.account_id).toEqual(newOwnerId);
      expect(getDocumentResponse.result.prev_transfers.length).toBeGreaterThan(
        0
      );
    });

    it(`Admin should be able to transfer document on the behalf of user`, async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerId = userSignUpOneAPIResponse.result.id;
      const response = await DocumentAPIs.transferDocument({
        accessToken,
        userId,
        documentId,
        newOwnerId,
        URL
      });

      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus('getDocument', {
        userId: userSignUpOneAPIResponse.result.id,
        accessToken: loginUserOneAPIResponse.result.access_token,
        documentId,
        URL
      });

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.owner.account_id).toEqual(newOwnerId);
      expect(getDocumentResponse.result.prev_transfers.length).toBeGreaterThan(
        0
      );
    });

    it('Document should not be transferred if document id is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uuidv4();
      const newOwnerId = userSignUpTwoAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be transferred if document is frozen', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const newOwnerId = userSignUpTwoAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be transferred if document is deleted', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentTwoAPIResponse.result.document.id;
      const newOwnerId = userSignUpTwoAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerId,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be transferred if userId or user address is invalid', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerAddress = uuidv4();
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerAddress,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be transferred if new owner is current document owner', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerAddress = userSignUpOneAPIResponse.result.address;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerAddress,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should be transferred with user address of toUser', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerAddress = userSignUpTwoAPIResponse.result.address;
      const response = await DocumentAPIs.transferDocument({
        accessToken,
        userId,
        documentId,
        newOwnerAddress,
        URL
      });

      CheckHelper.checkResponseType(response);

      const userTwoId = userSignUpTwoAPIResponse.result.id;
      const userTwoAccessToken = loginUserTwoAPIResponse.result.access_token;
      const getDocumentResponse = await dbStatus('getDocument', {
        userId: userTwoId,
        accessToken: userTwoAccessToken,
        documentId,
        URL
      });

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.owner.address).toEqual(newOwnerAddress);
      expect(getDocumentResponse.result.prev_transfers.length).toBeGreaterThan(
        0
      );
    });

    it('Admin should be able to transfer document even if the document is frozen', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const newOwnerAddress = userSignUpTwoAPIResponse.result.address;
      const response = await DocumentAPIs.transferDocument({
        accessToken,
        userId,
        documentId,
        newOwnerAddress,
        URL
      });

      CheckHelper.checkResponseType(response);

      const getDocumentResponse = await dbStatus('getDocument', {
        userId: userSignUpTwoAPIResponse.result.id,
        accessToken: loginUserTwoAPIResponse.result.access_token,
        documentId,
        URL
      });

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.owner.address).toEqual(newOwnerAddress);
      expect(getDocumentResponse.result.prev_transfers.length).toBeGreaterThan(
        0
      );
    });

    it('User should not be able to transfer the ownership of document of another user', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const newOwnerAddress = userSignUpOneAPIResponse.result.address;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({
          accessToken,
          userId,
          documentId,
          newOwnerAddress,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document Should not be transfered if none of the newOwner details are provided', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.transferDocument({ accessToken, userId, documentId, URL })
      );
      CheckHelper.checkError(response, err);
    });
  });

  describe('Document ownership history test', () => {
    const pageNumber = 1;
    const pageOffset = 10;

    it('User should be able to see ownership history of document owned', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const response = await DocumentAPIs.getDocumentOwnershipHistory({
        accessToken,
        userId,
        documentId,
        pageNumber,
        pageOffset,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it('Admin should be able to see any document ownership history of that organization', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const response = await DocumentAPIs.getDocumentOwnershipHistory({
        accessToken,
        userId,
        documentId,
        pageNumber,
        pageOffset,
        URL
      });
      CheckHelper.checkResponseType(response);
    });

    it(`History should not be viewed if document id is invalid`, async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const userId = userSignUpTwoAPIResponse.result.id;
      const documentId = uuidv4();
      const [response, err] = await of(
        DocumentAPIs.getDocumentOwnershipHistory({
          accessToken,
          userId,
          documentId,
          pageNumber,
          pageOffset,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it(`History should not be viewed if document is deleted`, async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentTwoAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.getDocumentOwnershipHistory({
          accessToken,
          userId,
          documentId,
          pageNumber,
          pageOffset,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it(`User should not be able to see ownership history of another user document`, async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const userId = userSignUpOneAPIResponse.result.id;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const [response, err] = await of(
        DocumentAPIs.getDocumentOwnershipHistory({
          accessToken,
          userId,
          documentId,
          pageNumber,
          pageOffset,
          URL
        })
      );
      CheckHelper.checkError(response, err);
    });

    it('Any user should be able to to view ownership history of their organization', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const response = await DocumentAPIs.getAllTransfers({ accessToken, URL });
      CheckHelper.checkResponseType(response);
    });
  });

  describe('Freeze document Test', () => {
    it('Document should not be frozen if document id is invalid', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uuidv4();
      const status = true;
      const [response, err] = await of(
        DocumentAPIs.freezeDocument({ accessToken, documentId, status, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should be frozen by admin only', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const status = true;
      const response = await DocumentAPIs.freezeDocument({
        accessToken,
        documentId,
        status,
        URL
      });

      CheckHelper.checkResponseType(response);

      const userId = userSignUpOneAPIResponse.result.id;
      const getDocumentResponse = await dbStatus(
        'getUpdatedStatusDocument',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        true
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.frozen).toEqual(true);
    });

    it('Document should not be frozen if document already froze', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const status = true;
      const [response, err] = await of(
        DocumentAPIs.freezeDocument({ accessToken, documentId, status, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('Document should not be frozen if document is deleted', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentTwoAPIResponse.result.document.id;
      const status = true;
      const [response, err] = await of(
        DocumentAPIs.freezeDocument({ accessToken, documentId, status, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('Admin should be able to unfreeze the document', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const status = false;
      const response = await DocumentAPIs.freezeDocument({
        accessToken,
        documentId,
        status,
        URL
      });

      CheckHelper.checkResponseType(response);

      const userId = userSignUpOneAPIResponse.result.id;
      const getDocumentResponse = await dbStatus(
        'getUpdatedStatusDocument',
        {
          userId,
          accessToken,
          documentId,
          URL
        },
        false
      );

      CheckHelper.checkResponseType(getDocumentResponse);
      expect(getDocumentResponse.result.frozen).toEqual(false);
    });

    it('Document should not be unfrozen if document is not frozen', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const status = false;
      const [response, err] = await of(
        DocumentAPIs.freezeDocument({ accessToken, documentId, status, URL })
      );
      CheckHelper.checkError(response, err);
    });
  });

  describe('Delete document Test', () => {
    it(`Admin should be able to delete document on the behalf of user`, async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentOneAPIResponse.result.document.id;
      const userId = userSignUpTwoAPIResponse.result.id;
      const response = await DocumentAPIs.deleteDocument({
        accessToken,
        documentId,
        userId,
        URL
      });

      CheckHelper.checkResponseType(response);

      const [getDocumentResponse, err1] = await dbStatus('deleteDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkError(getDocumentResponse, err1);
    });

    it('Document should not be deleted if document is invalid', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uuidv4();
      const userId = userSignUpOneAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.deleteDocument({ accessToken, documentId, userId, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('User Should not be able to delete the document of another user', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const userId = userSignUpTwoAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.deleteDocument({ accessToken, documentId, userId, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it(`User should be able to delete own document`, async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const response = await DocumentAPIs.deleteDocument({
        accessToken,
        documentId,
        userId,
        URL
      });

      CheckHelper.checkResponseType(response);
      const [getDocumentResponse, err1] = await dbStatus('deleteDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkError(getDocumentResponse, err1);
    });

    it('Document should not be deleted if it is already deleted', async () => {
      const accessToken = loginUserOneAPIResponse.result.access_token;
      const documentId = uploadDocumentFourAPIResponse.result.document.id;
      const userId = userSignUpOneAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.deleteDocument({ accessToken, documentId, userId, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('User should not be able to delete the document if it is frozen', async () => {
      const accessToken = loginUserTwoAPIResponse.result.access_token;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const userId = userSignUpTwoAPIResponse.result.id;
      const [response, err] = await of(
        DocumentAPIs.deleteDocument({ accessToken, documentId, userId, URL })
      );
      CheckHelper.checkError(response, err);
    });

    it('Admin should be able to delete the document even if it is frozen', async () => {
      const accessToken = loginAdminAPIResponse.result.access_token;
      const documentId = uploadDocumentThreeAPIResponse.result.document.id;
      const userId = userSignUpTwoAPIResponse.result.id;
      const response = await DocumentAPIs.deleteDocument({
        accessToken,
        documentId,
        userId,
        URL
      });

      CheckHelper.checkResponseType(response);

      const [getDocumentResponse, err1] = await dbStatus('deleteDocument', {
        userId,
        accessToken,
        documentId,
        URL
      });
      CheckHelper.checkError(getDocumentResponse, err1);
    });
  });
});
