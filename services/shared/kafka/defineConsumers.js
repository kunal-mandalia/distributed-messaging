const Consumer = require('./Consumer')

async function defineConsumers ({
  Kafka,
  producer,
  metadataBrokerList,
  consumersDefinition
}) {
  const consumers = consumersDefinition.map(consumerDefinition => {
    return Consumer({
      Kafka,
      metadataBrokerList,
      consumerGroupId: consumerDefinition.consumerGroupId,
      topicNames: consumerDefinition.topicNames,
      handler: consumerDefinition.handler(producer)
    })
  })
  return Promise.all(consumers)
}

module.exports = defineConsumers
