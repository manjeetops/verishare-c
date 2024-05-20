import { commonClassDecorator } from './commonClassDecorator'

function asyncFunctionWrapper (constructor, memberKey) {
  const memberFunction = constructor.prototype[memberKey]
  constructor.prototype[memberKey] = async function (requestData, context) {
    const span = context.tracer.startSpan(`${constructor.name}.${memberKey}`, context.span)
    context.span = span
    try {
      const result = await memberFunction.call(this, ...arguments)
      span.finish()
      return result
    } catch (e) {
      span.setTag('error', true)
      span.finish()
      throw e
    }
  }
}

function normalFunctionWrapper (constructor, memberKey) {
  const memberFunction = constructor.prototype[memberKey]
  constructor.prototype[memberKey] = function (requestData, context) {
    const span = context.tracer.startSpan(`${constructor.name}.${memberKey}`, context.span)
    context.span = span
    try {
      const result = memberFunction.call(this, ...arguments)
      span.finish()
      return result
    } catch (e) {
      span.setTag('error', true)
      span.finish()
      throw e
    }
  }
}

export const tracer = commonClassDecorator(asyncFunctionWrapper, normalFunctionWrapper)
