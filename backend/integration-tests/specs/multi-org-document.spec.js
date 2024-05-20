import of from 'await-of';
import UserAPIs from '../utils/user';
import CheckHelper from '../helpers/checkHelper';
import { dbStatus } from '../utils/status';

import {
  CREATE_ORGANIZATION_TEST_DATA,
  INVITATION_TEST_DATA,
  documentTestData,
} from '../testData';
import DocumentAPIs from '../utils/documents';

jest.setTimeout(50000);
let org1AdminAPIResponse;
let org2AdminAPIResponse;
let org1UserResponse;
let org2UserResponse;
let org1UserDoc;
let org2UserDoc;

const ORG_1_MAILHOG_URL = 'http://mailhog-0:8025/api/v2/messages'
const ORG_2_MAILHOG_URL = 'http://mailhog-1:8025/api/v2/messages'

const TIMESTAMP = new Date().getTime();

describe('Organization Test Started', () => {
  let org = {
    testData: CREATE_ORGANIZATION_TEST_DATA
  };
  const orgName = 'Boeing';
  describe('User onboarding tests', () => {
    beforeAll(async () => {
      const username = 'admin@boeing.com';
      const password = 'string';

      org1AdminAPIResponse = await UserAPIs.login({
        username,
        password,
        URL: `http://backend-1:3000/api/v1`
      });
      // Check message
      await CheckHelper.checkMessage(
        'loginMsg',
        org1AdminAPIResponse.metaData.message
      );

      org2AdminAPIResponse = await UserAPIs.login({
        username: 'admin@deqode.com',
        password: 'string',
        URL: `http://localhost:3000/api/v1`
      });

      await CheckHelper.checkMessage(
        'loginMsg',
        org2AdminAPIResponse.metaData.message
      );

      let inviteData1 = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
      inviteData1.email = `org1docUser1${TIMESTAMP}@gmail.com`;
      inviteData1.firstName = `org1docUser1${TIMESTAMP}`;
      inviteData1.lastName = `org1docUser1${TIMESTAMP}`;

      org1UserResponse = await UserAPIs.createUser({
        accessToken: org1AdminAPIResponse.result['access_token'],
        invitationData: inviteData1,
        URL: `http://backend-1:3000/api/v1`,
        mailhogUrl: ORG_2_MAILHOG_URL
      });

      const getUserResponse = await dbStatus('getUser', {
        accessToken: org2AdminAPIResponse.result['access_token'],
        userId: org1UserResponse[1].result.id,
        URL: `http://localhost:3000/api/v1`
      });

      CheckHelper.checkResponseType(getUserResponse)

      let inviteData2 = JSON.parse(JSON.stringify(INVITATION_TEST_DATA));
      inviteData2.email = `org2docUser1${TIMESTAMP}@gmail.com`;
      inviteData2.firstName = `org1docUser1${TIMESTAMP}`;
      inviteData2.lastName = `org1docUser1${TIMESTAMP}`;

      org2UserResponse = await UserAPIs.createUser({
        accessToken: org2AdminAPIResponse.result['access_token'],
        invitationData: inviteData2,
        URL: `http://localhost:3000/api/v1`,
        mailhogUrl: ORG_1_MAILHOG_URL
      });

      const getUserResponse1 = await dbStatus('getUser', {
        accessToken: org1AdminAPIResponse.result['access_token'],
        userId: org2UserResponse[1].result.id,
        URL: `http://backend-1:3000/api/v1`
      });

      CheckHelper.checkResponseType(getUserResponse1)

      // Check response
      CheckHelper.checkResponseType(org1UserResponse[0]);
      CheckHelper.checkToken(org1UserResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        org1UserResponse[0].metaData.message
      );

      // Check response
      CheckHelper.checkResponseType(org2UserResponse[0]);
      CheckHelper.checkToken(org2UserResponse[0]);
      await CheckHelper.checkMessage(
        'loginMsg',
        org2UserResponse[0].metaData.message
      );

      const formData1 = await documentTestData('false');

      org1UserDoc = await DocumentAPIs.uploadDocument({
        userId: org1UserResponse[1].result.id,
        accessToken: org1UserResponse[0].result['access_token'],
        formData: formData1,
        URL: `http://backend-1:3000/api/v1`
      });

      CheckHelper.checkResponseType(org1UserDoc);

      const response = await dbStatus('getDocument', {
        userId: org1UserResponse[1].result.id,
        accessToken: org1UserResponse[0].result['access_token'],
        documentId: org1UserDoc.result.document.id,
        URL: `http://backend-1:3000/api/v1`,
      });
      CheckHelper.checkResponseType(response);

      const formData2 = await documentTestData('false');

      org2UserDoc = await DocumentAPIs.uploadDocument({
        userId: org2UserResponse[1].result.id,
        accessToken: org2UserResponse[0].result['access_token'],
        formData: formData2,
        URL: `http://localhost:3000/api/v1`
      });
      CheckHelper.checkResponseType(org2UserDoc);
    });

    it('orgnization-1 user should not be able to view the document of organization-2 user', async () => {
      const [org2UserDocResponse, err] = await of(
        DocumentAPIs.getDocument({
          accessToken: org1UserResponse[0].result['access_token'],
          userId: org2UserResponse[1].result['id'],
          documentId: org2UserDoc.result.document.id,
          URL: `http://backend-1:3000/api/v1`
        })
      );
      CheckHelper.checkError(org2UserDocResponse, err);
    });

    it('orgnization-1 user should not be able to view all the documents of organization-2 user', async () => {
      let [org2UserDocResponse, err] = await of(
        DocumentAPIs.getDocumentsList({
          accessToken: org1UserResponse[0].result['access_token'],
          userId: org2UserResponse[1].result['id'],
          pageOffset: 1,
          pageNumber: 10,
          URL: `http://backend-1:3000/api/v1`
        })
      );

      CheckHelper.checkError(org2UserDocResponse, err);
    });

    it('orgnization-1 user should not be able to view the attestation of organization-2 user', async () => {
      let [org2UserDocResponse, err] = await of(
        DocumentAPIs.getAttestations({
          accessToken: org1UserResponse[0].result['access_token'],
          userId: org2UserResponse[1].result['id'],
          pageOffset: 1,
          pageNumber: 10,
          URL: `http://backend-1:3000/api/v1`
        })
      );

      CheckHelper.checkError(org2UserDocResponse, err);
    });

    it('orgnization-1 user should not be able to view the transfer history of organization-2 user', async () => {
      let [org2UserDocResponse, err] = await of(
        DocumentAPIs.getDocumentOwnershipHistory({
          accessToken: org1UserResponse[0].result['access_token'],
          documentId: org2UserDoc.result.document.id,
          userId: org2UserResponse[1].result['id'],
          pageOffset: 1,
          pageNumber: 10,
          URL: `http://backend-1:3000/api/v1`
        })
      );

      CheckHelper.checkError(org2UserDocResponse, err);
    });

    it('orgnization-1 user should be able to transfer document to the user of organization-2', async () => {
      let org2UserDocResponse = await DocumentAPIs.transferDocument({
        accessToken: org1UserResponse[0].result['access_token'],
        userId: org1UserResponse[1].result['id'],
        newOwnerId: org2UserResponse[1].result['id'],
        documentId: org1UserDoc.result.document.id,
        URL: `http://backend-1:3000/api/v1`
      });

      CheckHelper.checkResponseType(org2UserDocResponse);
    });
  });
});
