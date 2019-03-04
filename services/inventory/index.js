const app = require('express')()
const morgan = require('morgan')('tiny')
const Kafka = require('node-rdkafka')
const config = require('./config')
const routes = require('./routes')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const consumersDefinition = require('./kafka/consumersDefinition')

let runningService

app.use(morgan)
app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'Inventory',
    status: 'UP'
  })
})
app.use('/automation-testing', routes.automationTesting)

async function start () {
  return new Promise(async (resolve, reject) => {
    console.log(`starting inventory service`)
    console.log(config.get())
    try {
      const metadataBrokerList = config.get('kafka.metadataBrokerList')
      console.log(`defining producers`)
      const { producer } = await defineProducers({
        Kafka,
        metadataBrokerList
      })
      console.log(`defined producers`)
      await defineConsumers({
        Kafka,
        producer,
        metadataBrokerList,
        consumersDefinition
      })
      console.log(`defined consumers`)
      runningService = app.listen(config.get('port'), config.get('hostname'), () => {
        console.log(`Inventory service running at http://${config.get('hostname')}:${config.get('port')}/`)
        resolve()
      })
    } catch (error) {
      console.log('Error starting inventory service: ', error.message)
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
    const serviceNotAvailable = new Error(`inventory service not available`)
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
