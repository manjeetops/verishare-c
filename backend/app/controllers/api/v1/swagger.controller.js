import { definition } from '../../../../schemas/v1/backend'

export default class SwaggerController {
  static getSwaggerDefinition = (req, res) => {
    res.json(definition)
  }
}
