const asyncFunction = (async () => { }).constructor

export function commonMethodDecorator (asyncFunctionWrapper, normalFunctionWrapper) {
  return (target, propertyKey, descriptor) => {
    const fn = descriptor.value

    switch (fn instanceof asyncFunction) {
      case true:
        asyncFunctionWrapper(descriptor)
        break
      case false:
        normalFunctionWrapper(descriptor)
        break
    }

    return descriptor
  }
}
