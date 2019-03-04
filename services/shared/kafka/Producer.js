const { readyOrDie } = require('../networking')

function Producer ({ Kafka, metadataBrokerList }) {
  return new Promise(async (resolve, reject) => {
    let isReady = false

    const producer = new Kafka.Producer({
      // 'debug' : 'all',
      'metadata.broker.list': metadataBrokerList,
      'dr_cb': true // delivery report callback
    })

    producer.on('event.log', function (log) {
      console.log(log)
    })

    producer.on('event.error', function (err) {
      console.error('Error from producer')
      console.error(err)
    })

    producer.on('delivery-report', function (_, report) {
      console.log('delivery-report: ' + JSON.stringify(report))
    })

    producer.on('ready', function (arg) {
      console.log('producer ready.' + JSON.stringify(arg))
      isReady = true
      resolve(producer)
    })

    producer.on('disconnected', function (arg) {
      console.log('producer disconnected. ' + JSON.stringify(arg))
    })

    producer.connect()

    await readyOrDie({
      getIsReady: () => isReady,
      timeoutSeconds: 10
    })
  })
}

module.exports = Producer
