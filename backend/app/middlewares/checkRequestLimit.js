import { USER_TYPE_ENUM } from '../helpers/constants'

const checkRequestLimit = async (req, res, next) => {
  if (req['adminUser'] || req['user'].type !== USER_TYPE_ENUM.SERVICE_ACCOUNT) {
    return next()
  }
  const { request_limit_used, request_limit_assigned } = req.user.organization
  if (request_limit_used >= request_limit_assigned) {
    return res.boom.unauthorized('API rate limit exceeded of your account!')
  }
  next()
}

export { checkRequestLimit }
