import express from 'express'
import { orgSuperAdminRouter, orgRouter, orgPublicRouter } from './org.router'
import { attestationProtectedRouter } from './attestations.router'
import userRouter from './user.router'
import invitesRouter from './invites.router'
import serviceAccountRouter from './serviceAccounts.router'
import { documentProtectedRouter, documentPublicRouter } from './documents.router'
import keyclockOrgSelector from '../../../app/middlewares/keyclockOrgSelector'
import { authenticateUser } from '../../../app/auth_stratagies/authenticateUser'
import swaggerRouter from './swagger.router';

const router = express.Router()
const NAMESPACE = 'v1'

//swagger-api
router.use(`/${NAMESPACE}`, swaggerRouter)

// Documents API
// Public route
router.use(`/${NAMESPACE}`, documentPublicRouter)

// Organizations API
// Public route
router.use(`/${NAMESPACE}`, orgPublicRouter)

// user routes
router.use(`/${NAMESPACE}`, userRouter)

// invites routes
router.use(`/${NAMESPACE}`, invitesRouter)

// Organization router
router.use(`/${NAMESPACE}`, orgRouter)

// create organization route with basic auth middleware
router.use(`/${NAMESPACE}/organizations`,authenticateUser, orgSuperAdminRouter)

// Protected Route
router.use(`/${NAMESPACE}/users/:user_id`,
  keyclockOrgSelector('GRANT_ATTACHER'),
  documentProtectedRouter
)

// Protected route
router.use(`/${NAMESPACE}`,
  keyclockOrgSelector('GRANT_ATTACHER'),
  attestationProtectedRouter
)

// Service Account API
// Protected Route
router.use(`/${NAMESPACE}`,
  serviceAccountRouter
)

export default router
