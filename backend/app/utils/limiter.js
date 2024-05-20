import Bottleneck from 'bottleneck'
import config from '../../config/app'

const limiter = new Bottleneck({
  // How many jobs can be executing at the same time. Consider setting a value instead of leaving it null, it can help your application's performance, especially if you think the limiter's q
  maxConcurrent: config.get('limiter.max_concurrent_requests'),

  // How long to wait after launching a job before launching another one.
  minTime: config.get('limiter.wait_between_requests'),

  // All limiters with the same id will be clustered together
  id: config.get('limiter.limiter_id'),

  // Where the limiter stores its internal state. The default ("local") keeps the state in the limiter itself. Set it to "redis" or "ioredis" to enable Clustering.
  datastore: config.get('limiter.datastore'),
  clearDatastore: true,
  clientOptions: {
    url: config.get('limiter.redis.url')
  }
})


const wrap = (fn) => limiter.wrap(fn)

export default wrap
