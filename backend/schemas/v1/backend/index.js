import * as definitions from './definition'
import * as paths from './path'

export const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Backend',
    description: 'Backend APIs',
    version: '1.0.0'
  },
  paths: paths.default,
  components: {
    schemas: definitions,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      basicAuth: {
        type: 'http',
        scheme: 'basic',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    },
    {
      basicAuth: []
    }
  ]
}
