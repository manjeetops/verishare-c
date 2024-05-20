import { createLogger, format, transports } from 'winston'
import * as _ from 'lodash'
import httpContext from 'express-http-context'
import config from '../config/app'

const { prettyPrint, combine, timestamp, splat, simple, colorize, printf, errors } = format

const ENV = config.get('env')
const LOG_LEVEL = config.get('log_level')

const errorStackTracerFormat = format(info => {
  if (info.meta && info.meta instanceof Error) {
    info.message += ` ${info.message} ${info.meta.stack}`
  }

  return info
})

const formatMessage = ({ timestamp, level, message, requestId, args }) => {
  let formattedMessage = `${timestamp} [${level}] `

  if (requestId) formattedMessage += `[RequestId: ${requestId}] `

  formattedMessage += `${message}: `
  formattedMessage += ` ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`

  return formattedMessage
}

const formatErrorMessage = format(info => {
  // Only modify the info it there was an error
  if (info.stack === undefined) {
    return info
  }

  const { message } = info

  // Get the original error message
  const errorMessage =
    info[Symbol.for('splat')] &&
    info[Symbol.for('splat')][0] &&
    info[Symbol.for('splat')][0].message

  // Check that the original error message was concatenated to the message
  if (
    errorMessage === undefined ||
    message.length <= errorMessage.length ||
    !message.endsWith(errorMessage)
  ) {
    return info
  }

  // Slice off the original error message from the log message
  info.message = message.slice(0, errorMessage.length * -1);
  return info
})

const rTracerFormat = printf(info => {
  let { timestamp, level, message, ...args } = info
  args = _.omit(args, ['context', 'wrap'])

  const requestId = httpContext.get('requestId')
  return formatMessage({ timestamp, level, message, requestId, args })
})

const baseOptions = [timestamp(), splat(), simple(), errors({ stack: true }), formatErrorMessage(), errorStackTracerFormat(), rTracerFormat]

let winstonFormat = combine(format.json(), ...baseOptions)
if (ENV === 'development') {
  winstonFormat = combine(colorize(), prettyPrint(), ...baseOptions)
}

const logger = createLogger({
  format: winstonFormat,
  level: LOG_LEVEL,
  transports: [new transports.Console()]
})

export default logger
