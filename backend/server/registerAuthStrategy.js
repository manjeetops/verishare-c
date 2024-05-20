import passport from 'passport'
import config from '../config/app'
import Log from './logger'
import { BasicStrategy } from 'passport-http'

const registerAuthStrategy = () => {
  passport.use('internal', new BasicStrategy({ passReqToCallback: true },
    async function (req, username, password, done) {
      // basic - cm9razNyOnJva2szckAxMjM
      const superAdminUsername = config.get('deqode.super_admin_username')
      const superAdminPassword = config.get('deqode.super_admin_password')
      if (username !== superAdminUsername || password !== superAdminPassword) {
        Log.info('Invalid user')
        return done(null, false)
      }
      req['superAdmin'] = true
      return done(null, true)
    }
  ))
}

export default registerAuthStrategy
