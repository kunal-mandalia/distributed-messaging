const app = require('express')()
const morgan = require('morgan')('tiny')
const Kafka = require('node-rdkafka')
const WebSocket = require('ws')
const config = require('./config')
const defineConsumers = require('../shared/kafka/defineConsumers')
const { defineProducers } = require('../shared/kafka/producers')
const { generateConsumersDefinition } = require('./kafka/consumersDefinition')
// const routes = require('./routes')

let wss
let runningService

app.use(morgan)
app.get('/health', (req, res) => {
  return res.status(200).json({
    app: 'Notification',
    status: 'UP'
  })
})

function initialiseWebsockets () {
  return new Promise((resolve) => {
    wss = new WebSocket.Server({
      port: config.get('port')
    })

    wss.on('connection', function connection (ws, req) {
      console.log('connection req: ', req)
      ws.on('message', function incoming (message) {
        console.log('received: %s', message)
      })

      ws.send('something')
    })
    resolve()
  })
}

async function start () {
  return new Promise(async (resolve, reject) => {
    try {
      const metadataBrokerList = config.get('kafka.metadataBrokerList')
      const { producer } = await defineProducers({
        Kafka,
        metadataBrokerList
      })
      await initialiseWebsockets()
      const consumersDefinition = generateConsumersDefinition(wss)
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
