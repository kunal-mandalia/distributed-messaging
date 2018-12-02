const app = require('express')()
const order = require('./service')
const config = require('./config')
const morgan = require('morgan')('tiny')

let runningService

app.use(morgan)
app.use('/order', order)
app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'Order',
    status: 'UP'
  })
})

async function start() {
  return new Promise((resolve, reject) => {
    runningService = app.listen(config.get('port'), config.get('hostname'), () => {
      console.log(`Order service running at http://${config.get('hostname')}:${config.get('port')}/`)
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