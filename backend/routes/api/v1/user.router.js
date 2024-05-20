import express from 'express'
import userController from '../../../app/controllers/api/v1/user.controller'
import keycloakProtect from '../../../app/middlewares/keycloakProtect'
import keyclockOrgSelector from '../../../app/middlewares/keyclockOrgSelector'

const userRouter = express.Router({ mergeParams: true })
userRouter.route('/signup').post(
  userController.signup
)

userRouter.route('/protocol/openid-connect/login').post(
  userController.login
)

// TODO: Need to implement access token revoke list
userRouter.route('/protocol/openid-connect/logout').post(
  userController.logout
)

userRouter.route('/user-info').get(
  keyclockOrgSelector('GRANT_ATTACHER'),
  keycloakProtect(),
  userController.getUserInfo
)

userRouter.route('/protocol/openid-connect/token').post(
  userController.getNewAccessToken
)

export default userRouter
