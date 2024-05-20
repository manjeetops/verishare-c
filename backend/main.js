import * as server from './server'
import 'reflect-metadata'

const logErrors = (error) => {
  server.logger.error(error.message, { stack: error.stack })
  throw error
}

process.on('uncaughtException ', logErrors)
process.on('unhandledRejection', (error) => {
  console.log(error)
})
server.app.start()
console.log('server main')
