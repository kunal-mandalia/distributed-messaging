function Consumer ({
  Kafka,
  consumerGroupId,
  topicNames,
  handler,
  metadataBrokerList
}) {
  return new Promise((resolve, reject) => {
    const consumer = new Kafka.KafkaConsumer({
      // 'debug': 'all',
      'metadata.broker.list': metadataBrokerList,
      'group.id': consumerGroupId,
      'enable.auto.commit': false
    })

    // logging debug messages, if debug is enabled
    consumer.on('event.log', function (log) {
      console.log(log)
    })

    consumer.on('event.error', function (err) {
      console.error('Error from consumer')
      console.error(err)
    })

    consumer.on('ready', function (arg) {
      console.log('consumer ready.' + JSON.stringify(arg))

      consumer.subscribe(topicNames)
      consumer.consume()
      resolve()
    })

    consumer.on('data', handler(consumer))

    consumer.on('disconnected', function (arg) {
      console.log('consumer disconnected. ' + JSON.stringify(arg))
    })

    // starting the consumer
    consumer.connect()
  })
}

module.exports = Consumer
