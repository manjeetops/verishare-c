import GetOrganizationUsers from '../../../services/organization/getOrgUsersList';
import GetAllUsers from '../../../services/organization/getAllUsers';
import Responder from '../../../../server/expressResponder';
import GetOrgUser from '../../../services/organization/getOrgUser';
import UpdateUserStatus from '../../../services/organization/updateUserStatus';
import GetAllDocuments from '../../../services/documents/getAllDocuments';
import GetOrgList from '../../../services/organization/getOrgList';
import GetOrgInfo from '../../../services/organization/getOrg';
import { logAndThrowError } from '../../../utils/error';
import CreateOrganizationInBlockchain from '../../../services/organization/createOrgInBlockchain';
import UpdateOrgStatus from '../../../services/organization/updateOrgStatus';
import FreezeDocument from '../../../services/documents/freezeDocument';

export default class OrgController {
  static async CreateOrgInBlockchain(req, res) {
    const [response, err] = await CreateOrganizationInBlockchain.run(req.body);
    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Organization creation on blockchain failed', err, res);
    }
  }

  static async updateOrgStatus(req, res) {
    const [response, err] = await UpdateOrgStatus.run({
      ...req.params,
      ...req.body
    });
    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Organization creation on blockchain failed', err, res);
    }
  }

  static async getAllUsers(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [response, err] = await GetAllUsers.run({
      ...req.query,
      keycloakSubId
    });

    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Users not fetched ', err, res);
    }
  }

  // Get Organization Users - accessible by anyone
  static async getOrganizationUsers(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [response, err] = await GetOrganizationUsers.run({
      orgId: req.params['organization_id'],
      ...req.query,
      keycloakSubId
    });

    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Organization Users not fetched ', err, res);
    }
  }

  // Get Organization User - accessible by super admin and organization-admin
  static async getUser(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const reqData = {
      ...req.body,
      ...req.params,
      keycloakSubId
    };

    const [response, err] = await GetOrgUser.run(reqData);
    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Organization User details not fetched', err, res);
    }
  }

  // Block User - accessible by super-admin and organization admin
  static async updateUserStatus(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const reqData = {
      ...req.params,
      ...req.body,
      keycloakSubId
    };

    const [response, err] = await UpdateUserStatus.run(reqData);
    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('Blocking user failed ', err, res);
    }
  }

  // Display all documents - only accessible by organization admin
  static async getAllDocuments(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [result, errors] = await GetAllDocuments.run({
      ...req.params,
      ...req.query,
      keycloakSubId
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the documents ', errors, res);
    }
  }

  static async freezeDocument(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const { sub: keycloakSubId } = keycloakToken.content;

    const [response, err] = await FreezeDocument.run({
      ...req.body,
      ...req.params,
      keycloakSubId
    });
    if (response) {
      Responder.sendJSONResponse(res, response);
    } else {
      logAndThrowError('document could not be frozen', err, res);
    }
  }

  // Public route - Get organizations list
  static async getOrgList(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const [result, errors] = await GetOrgList.run({
      ...req.query,
      keycloakToken
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the organizations ', errors, res);
    }
  }

  static async getOrgInfo(req, res) {
    const keycloakToken =
      req.kauth && req.kauth.grant && req.kauth.grant['access_token'];
    const [result, errors] = await GetOrgInfo.run({
      ...req.params,
      keycloakToken
    });
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching the organization', errors, res);
    }
  }

  static async getBlockStatus(req, res) {
    const [result, errors] = await GetOrgInfo.run();
    if (result) {
      Responder.sendJSONResponse(res, result);
    } else {
      logAndThrowError('Error fetching block status ', errors, res);
    }
  }
}
