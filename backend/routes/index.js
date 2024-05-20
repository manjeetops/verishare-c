import apiRoutes from './api'
// import routes
// import './api'

const initRoutes = (app) => {
  app.use(apiRoutes)

  app.get('/healthcheck', (req, res) => {
    res.sendStatus(200)
  })
}

export default initRoutes
