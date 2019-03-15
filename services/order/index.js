const app = require('express')()
const Kafka = require('node-rdkafka')
const morgan = require('morgan')('tiny')
const bodyParser = require('body-parser')
const config = require('./config')
const routes = require('./routes')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const consumersDefinition = require('./kafka/consumersDefinition')
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
  return new Promise(async (resolve, reject) => {
    console.log(`starting ${APP_NAME} service`)
    console.log(config.get())
    try {
      const metadataBrokerList = config.get('kafka.metadataBrokerList')
      console.log(`defining kafka producers`)
      const { producer } = await defineProducers({
        Kafka,
        metadataBrokerList
      })
      console.log(`defined kafka producers. Defining kafka consumers`)
      await defineConsumers({
        Kafka,
        producer,
        metadataBrokerList,
        consumersDefinition
      })
      console.log(`defining kafka consumers`)
      runningService = app.listen(config.get('port'), config.get('hostname'), () => {
        console.log(`${APP_NAME} service running at http://${config.get('hostname')}:${config.get('port')}/`)
        readiness.set(APP_NAME, true)
        resolve()
      })
    } catch (error) {
      console.log(`Error starting ${APP_NAME} service`, error.message)
      readiness.set(APP_NAME, false)
      reject(error)
    }
  })
}

async function close () {
  return new Promise((resolve, reject) => {
    if (runningService) {
      runningService.close()
      resolve()
    }
    const serviceNotAvailable = new Error(`${APP_NAME} service not available`)
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
