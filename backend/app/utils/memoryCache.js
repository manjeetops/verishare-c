import NodeCache from 'node-cache'
// TODO: clean code
// const promisify = f => (...args) => new Promise((a, b) => f(...args, (err, res) => err ? b(err) : a(res)))

class MemoryCache {
  constructor (ttlSeconds) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false })
  }

  get (key) {
    return this.cache.get(key)
  }

  set (key, data) {
    this.cache.set(key, data)
  }

  getStats () {
    return this.cache.getStats()
  }
}

export default MemoryCache
