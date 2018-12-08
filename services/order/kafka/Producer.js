var Kafka = require('node-rdkafka')

function Producer({ metadataBrokerList }) {
  return new Promise((resolve, reject) => {
    const producer = new Kafka.Producer({
      //'debug' : 'all',
      'metadata.broker.list': metadataBrokerList,
      'dr_cb': true  //delivery report callback
    })
    
    producer.on('event.log', function(log) {
      console.log(log)
    })
    
    producer.on('event.error', function(err) {
      console.error('Error from producer')
      console.error(err)
    })
    
    producer.on('delivery-report', function(err, report) {
      console.log('delivery-report: ' + JSON.stringify(report))
    })
    
    producer.on('ready', function(arg) {
      console.log('producer ready.' + JSON.stringify(arg))
      resolve(producer)
    })
    
    producer.on('disconnected', function(arg) {
      console.log('producer disconnected. ' + JSON.stringify(arg))
    })
    
    producer.connect()
  })
}

module.exports = Producer