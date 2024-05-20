const asyncFunction = (async () => { }).constructor

export function commonClassDecorator (asyncFunctionWrapper, normalFunctionWrapper) {
  return function (constructor) {
    Reflect.ownKeys(constructor.prototype).forEach(
      (memberKey) => {
        const member = constructor.prototype[memberKey]
        if (typeof member === 'function' && memberKey !== 'constructor') {
          switch (member instanceof asyncFunction) {
            case true:
              asyncFunctionWrapper(constructor, memberKey.toString())
              break
            case false:
              normalFunctionWrapper(constructor, memberKey.toString())
              break
          }
        }
      }
    )
  }
}
