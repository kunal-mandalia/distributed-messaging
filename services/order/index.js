const app = require('express')()
const Kafka = require('node-rdkafka')
const morgan = require('morgan')('tiny')
const bodyParser = require('body-parser')
const config = require('./config')
const routes = require('./routes')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const consumersDefinition = require('./kafka/consumersDefinition')

let runningService

app.use(morgan)
app.use(bodyParser.json())
app.use('/order', routes.order)
app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'Order',
    status: 'UP'
  })
})

async function start () {
  return new Promise(async (resolve, reject) => {
    console.log(`starting order service`)
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
        console.log(`Order service running at http://${config.get('hostname')}:${config.get('port')}/`)
        resolve()
      })
    } catch (error) {
      console.log('Error starting order service: ', error.message)
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
    const serviceNotAvailable = new Error(`order service not available`)
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
