import './router'
import express from 'express'
import cors from 'cors'
import registerAuthStaretegy from './registerAuthStrategy'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import compression from 'compression'
import helmet from 'helmet'
import routesInitiator from '../routes'
import expressBoom from 'express-boom'
import session from 'express-session'
import httpContext from 'express-http-context'
import uuidv4 from 'uuid/v4'

// Initialize express app
const app = express()

function initMiddleware() {
  // Helmet is a collection of 12 middleware to help set some security headers.
  app.use(helmet())
  // Enable cors
  app.use(cors())
  // Showing stack errors
  app.set('showStackError', true)

  app.use(expressBoom())

  app.use(httpContext.middleware)

  // Run the context for each request. Assign a unique identifier to each request
  app.use((req, res, next) => {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
    httpContext.set('requestId', uuidv4())
    next()
  })

  // Initialize Passport Strategies
  registerAuthStaretegy()

  // Keycloak middlewares
  app.use(session({ secret: 'keycloak-middleware-secret' }))

  app.set('trust proxy', 'loopback')

  // Enable jsonp
  app.enable('jsonp callback')

  // Enable logger (morgan)
  app.use(morgan('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'))

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Disable views cache
    app.set('view cache', false)
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory'
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  app.use(bodyParser.json({ limit: '1000mb' }))

  app.use(methodOverride())

  app.use(compression())

  app.set('trust proxy', true)
}

export function init() {
  // Initialize Express middleware
  initMiddleware()

  // Initialize modules server routes
  routesInitiator(app)

  return app
}
