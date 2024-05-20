import Token from '../services/keycloak/token';
import config from '../../config/app';
import GetUser from '../services/user/getUser';

const ROLE = `realm:${config.get('org_roles.admin')}`;

const isAdmin = ({ token }) => {
  const tokenInstance = new Token(token, config.get('keycloak.default_client'));
  return tokenInstance.hasRole(ROLE);
};

const validateUser = async (req, res, next) => {
  const userId = req.params['user_id'];
  const keycloakAccessToken = req.kauth.grant['access_token'];
  const keycloakSubjectId = keycloakAccessToken.content.sub;
  // Search user by keycloakSubjectId OR userId
  const userByToken = await GetUser.perform({ keycloakId: keycloakSubjectId });
  if (!userByToken) {
    throw new Error(`User ${keycloakSubjectId} not found`);
  }

  const userById = await GetUser.perform({ blockchainId: userId });
  if (!userById) {
    throw new Error(`User ${userId} not found`);
  }

  const isOrgAdmin = isAdmin(keycloakAccessToken);

  if (userByToken.blockchainId === userById.blockchainId) {
    req.user = userByToken;
    req.adminUser = isOrgAdmin ? userByToken : false;
  } else if (userByToken.orgId === userById.orgId) {
    if (!isOrgAdmin) {
      return res.boom.unauthorized(
        'You are not authorized to perform this transaction'
      );
    }
    req.user = userById;
    req.adminUser = userByToken;
  } else {
    return res.boom.unauthorized(
      `User ${userId} is not part of this organization`
    );
  }

  next();
};

export { validateUser };
