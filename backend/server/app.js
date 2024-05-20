import config from '../config/app'
import * as express from './express'
import logger from './logger'
import '../app/workers'
import connectDB from './connectDB'

const start = async () => {
  const port = config.get('port')

  const appStartMessage = () => {
    const env = process.env.NODE_ENV
    logger.debug(`Initializing API`)
    logger.info(`Server Name : ${config.get('app.name')}`)
    logger.info(`Environment  : ${env || 'development'}`)
    logger.info(`App Port : ${port}`)
    logger.info(`Process Id : ${process.pid}`)
  }

  // Connecting mongo Database
  try {
    await connectDB()
  } catch (err) {
    console.error('Error while connecting DB =====>', err)
    console.error('<===== Exiting the process =====>')
    process.exit(1)
  }
  const app = express.init()
  app.listen(port, appStartMessage)
}

export default start
