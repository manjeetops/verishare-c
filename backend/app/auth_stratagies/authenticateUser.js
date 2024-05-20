import passport from 'passport'

const authenticateUser = passport.authenticate('internal', { session: false })

export { authenticateUser }
