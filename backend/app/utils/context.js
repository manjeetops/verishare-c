import logger from '../../server/logger'

export function getCtx() {
  return Object.freeze({ logger })
}
