const app = require('express')()
const Kafka = require('node-rdkafka')
const morgan = require('morgan')('tiny')
const bodyParser = require('body-parser')
const config = require('./config')
const routes = require('./routes')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const consumersDefinition = require('./kafka/consumers')

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

const metadataBrokerList = config.get('kafka.metadataBrokerList')

async function start() {
  return new Promise(async (resolve, reject) => {
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
      console.log(`Order service running at http://${config.get('hostname')}:${config.get('port')}/`)
      resolve()
    })
  })
}

async function close() {
  // TODO: shutdown kafka producers / consumers safely?
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