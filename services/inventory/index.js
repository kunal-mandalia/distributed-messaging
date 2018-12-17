const app = require('express')()
const morgan = require('morgan')('tiny')
const Kafka = require('node-rdkafka')
const config = require('./config')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const consumersDefinition = require('./kafka/consumersDefinition')
const routes = require('./routes')

let runningService

app.use(morgan)
app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'Inventory',
    status: 'UP'
  })
})
app.use('/automation-testing', routes.automationTesting)

async function start() {
  return new Promise(async (resolve, reject) => {
    try {
      const metadataBrokerList = config.get('kafka.metadataBrokerList')
      const { producer } = await defineProducers({
        Kafka,
        metadataBrokerList
      })
      await defineConsumers({
        Kafka,
        producer,
        metadataBrokerList,
        consumersDefinition
      })
      runningService = app.listen(config.get('port'), config.get('hostname'), () => {
        console.log(`Inventory service running at http://${config.get('hostname')}:${config.get('port')}/`)
        resolve()
      })
    } catch (error) {
      console.log("Error starting inventory service: ", error.message)
      reject(error.message)
    }
  })
}

async function close() {
  return new Promise((resolve, reject) => {
    if (runningService) {
      runningService.close()
      resolve()
    }
    reject("Inventory service is not running")
  })
}

if (module.id === require.main.id) {
  start()
}

module.exports = {
  start,
  close
}