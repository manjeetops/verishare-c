
export default class Logger {
  constructor () {
    this.logger = console
  }

  info (logTitle, argHash) {
    this.log('info', logTitle, argHash)
  }

  debug (logTitle, argHash) {
    this.log('debug', logTitle, argHash)
  }

  error (logTitle, argHash) {
    this.log('error', logTitle, argHash)
  }

  log (logType, logTitle, argHash) {
    const allArgs = Object.assign({ logTitle }, argHash)
    const logMessage = this.buildMessage(allArgs)
    this.writeToLog(logType, logTitle, logMessage, argHash)
  }

  writeToLog (logType, logTitle, logMessage, argHash) {
    if (argHash && ['start', 'around'].indexOf(argHash.wrap) !== -1) {
      this.logger[logType](this.generateWrapStr(logTitle, 'START'))
    } else if (argHash && ['end', 'around'].indexOf(argHash.wrap) !== -1) {
      this.logger[logType](this.generateWrapStr(logTitle, 'END'))
    } else {
      this.logger[logType](...logMessage)
    }
  }

  generateWrapStr (logTitle, separatorType) {
    return `${separatorType}${'='.repeat(5)}${logTitle}${'='.repeat(5)}${separatorType}`
  }

  buildMessage (logAttrs) {
    const msg = [`${logAttrs.logTitle} => `]
    if (logAttrs.klass) { msg.push('Class:', logAttrs.klass.name, ',') }
    if (logAttrs.message) { msg.push('Message:', logAttrs.message, ',') }
    if (logAttrs.context) { msg.push('Context:', logAttrs.context, ',') }
    if (logAttrs.metadata) { msg.push('Metadata:', logAttrs.metadata, ',') }
    if (logAttrs.tagCtx) { msg.push('TagsCtx:', logAttrs.tagCtx, ',') }
    if (logAttrs.userCtx) { msg.push('UserCtx:', logAttrs.userCtx, ',') }
    if (logAttrs.exception) { msg.push('ExceptionBacktrace:', logAttrs.exception.stack, ',') }
    if (logAttrs.fault) { msg.push('Fault:', logAttrs.fault, ',') }
    return msg
  }
}
