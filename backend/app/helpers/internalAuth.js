import passport from 'passport'

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json({ message: 'Unautorized request' })
  }
}

const authenticate = passport.authenticate('internal', { session: false })

export { isAuthenticated, authenticate }
