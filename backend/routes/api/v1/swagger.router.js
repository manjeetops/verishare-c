import express from 'express'
import SwaggerController from '../../../app/controllers/api/v1/swagger.controller';
const args = { mergeParams: true }
const swaggerRouter = express.Router(args)

swaggerRouter.route('/swagger')
  .get(SwaggerController.getSwaggerDefinition)

export default swaggerRouter
