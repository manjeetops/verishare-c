import FastestValidator from 'fastest-validator'
import { ValidationError } from '../errors'
import { commonMethodDecorator } from './commonMethodDecorator'

const fastestValidator = new FastestValidator()

function compile (schema) {
  return fastestValidator.compile(schema)
}

function asyncFunctionWrapper (compliedSchema, descriptor) {
  const fn = descriptor.value
  descriptor.value = async function (requestData, context, logger) {
    const res = compliedSchema(requestData)

    if (res === true) {
      const result = await fn.call(this, ...arguments)
      return result
    }
    throw new ValidationError(res)
  }
}

function normalFunctionWrapper (compliedSchema, descriptor) {
  const fn = descriptor.value
  descriptor.value = function (requestData, context, logger) {
    const res = compliedSchema(requestData)
    if (res === true) {
      return fn.call(this, ...arguments)
    }
    throw new ValidationError(res)
  }
}

export function argumentsValidator (validationSchema = {}) {
  const compliedSchema = compile(validationSchema)
  return commonMethodDecorator(
    asyncFunctionWrapper.bind(null, compliedSchema),
    normalFunctionWrapper.bind(null, compliedSchema))
}
