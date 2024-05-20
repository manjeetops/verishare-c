import * as _ from 'lodash'
import { commonClassDecorator } from './commonClassDecorator'
import logger from '../../../server/logger'

function asyncFunctionWrapper (constructor, memberKey) {
  const memberFunction = constructor.prototype[memberKey]
  constructor.prototype[memberKey] = async function (requestData, context) {
    const request = _.cloneDeep(requestData)

    logger.info(
      `Service Started: ${constructor.name}.${memberKey.toString()}`,
      { context: request, wrap: 'start' }
    )
    let result
    try {
      result = await memberFunction.call(this, ...arguments)
    } catch (error) {
      logger.error(
        `Service Finished with error: ${constructor.name}.${memberKey.toString()}, error: ${error}`,
        { context: request, wrap: 'end' }
      )
      throw error
    }

    logger.info(
      `Service Finished: ${constructor.name}.${memberKey.toString()}`,
      { context: request, wrap: 'end' }
    )

    return result
  }
}

function normalFunctionWrapper (constructor, memberKey) {
  const memberFunction = constructor.prototype[memberKey]
  constructor.prototype[memberKey] = function (requestData, context) {
    const request = _.cloneDeep(requestData)

    logger.info(
      `Service Started: ${constructor.name}.${memberKey.toString()}`,
      { context: request, wrap: 'start' }
    )

    let result

    try {
      result = memberFunction.call(this, ...arguments)
    } catch (error) {
      logger.error(
        `Service Finished with error: ${constructor.name}.${memberKey.toString()}, error: ${error}`,
        { context: request, wrap: 'end' }
      )
      throw error
    }

    logger.info(
      `Service Finished: ${constructor.name}.${memberKey.toString()}`,
      { context: request, wrap: 'end' }
    )
    return result
  }
}

export const log = commonClassDecorator(asyncFunctionWrapper, normalFunctionWrapper)
