import serializeError from 'serialize-error'
import logger from '../../server/logger'

export const logAndThrowError = (msg, err, res) => {
  const error = serializeError(err)
  logger.error(error.stack)
  return res.boom.badRequest(`${msg}: ${error.message}`)
}

