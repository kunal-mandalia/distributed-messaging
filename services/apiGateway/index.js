
const app = require('express')()
const config = require('./config')
const morgan = require('morgan')('tiny')
const bodyParser = require('body-parser')
const routes = require('./routes')
const { readiness } = require('../shared/readiness')
const { APP_NAME } = require('./constants')

let runningService

app.use(morgan)
app.use(bodyParser.json())
app.use('/order', routes.order)

app.get('/liveness', (req, res) => {
  return res.status(200).json({
    app: APP_NAME,
    status: 'UP'
  })
})
app.get('/readiness', (req, res) => {
  return res.status(200).json({
    app: APP_NAME,
    ready: readiness.getIsReady(APP_NAME)
  })
})

async function start () {
  return new Promise((resolve, reject) => {
    runningService = app.listen(config.get('port'), config.get('hostname'), () => {
      console.log(`${APP_NAME} service running at http://${config.get('hostname')}:${config.get('port')}/\n`)
      readiness.set(APP_NAME, true)
      resolve()
    })
  })
}

async function close () {
  return new Promise((resolve, reject) => {
    if (runningService) {
      runningService.close(() => {
      })
      resolve()
    }
    const serviceNotAvailable = new Error(`apiGateway service not available`)
    reject(serviceNotAvailable)
  })
}

if (module.id === require.main.id) {
  start()
}

module.exports = {
  start,
  close
}
