const Consumer = require('./Consumer')

async function defineConsumers({
  Kafka,
  producer,
  metadataBrokerList,
  consumersDefinition
}) {
  consumersDefinition.map(consumerDefinition => {
    return Consumer({
      Kafka,
      metadataBrokerList,
      consumerGroupId: consumerDefinition.consumerGroupId,
      topicNames: consumerDefinition.topicNames,
      handler: consumerDefinition.handler(producer)
    })
  })
}

module.exports = defineConsumers
