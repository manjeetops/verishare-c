import of from 'await-of'
import _ from 'lodash'
import { getCtx } from './context'

export default class ActionBase {
  constructor() {
    this.errors = {}
  }

  static async perform(request, context, logger) {
    const instance = new this()
    let result
    try {
      result = await instance.perform(request, context, logger)
    } catch (error) {
      throw error
    }

    return result
  }

  static async execute(request, context, logger) {
    const instance = new this()

    const result = await instance.perform(request, context, logger)

    return result
  }

  static async run(request, context, logger) {
    if (!context) context = getCtx()

    const [result, error] = await of(this.perform(request, context, logger))
    return [result, error]
  }

  async perform(requestData, context, logger) {
    throw new Error('Perform method not defined')
  }
}
