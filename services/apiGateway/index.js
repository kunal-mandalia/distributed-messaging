
const app = require('express')()
const config = require('./config')
const morgan = require('morgan')('tiny')
const bodyParser = require('body-parser')
const routes = require('./routes')

let runningService

app.use(morgan)
app.use(bodyParser.json())
app.use('/order', routes.order)

app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'API Gateway',
    status: 'UP'
  })
})

async function start() {
  return new Promise((resolve, reject) => {
    runningService = app.listen(config.get('port'), config.get('hostname'), () => {
      console.log(`API Gateway service running at http://${config.get('hostname')}:${config.get('port')}/\n`)
      resolve()
    })
  })
}

async function close() {
  return new Promise((resolve, reject) => {
    if (runningService) {
      runningService.close(() => {
      })
      resolve()
    }
    reject()
  })
}

if (module.id === require.main.id) {
  start()
}

module.exports = {
  start,
  close
}
