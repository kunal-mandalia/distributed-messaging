const Consumer = require('./Consumer')
const config = require('../config')

const consumers = {}

async function defineConsumers(producer) {
  const metadataBrokerList = config.get('kafka.metadataBrokerList')
  const orderConsumer = await Consumer({
    metadataBrokerList,
    consumerGroupId: 'order',
    topicNames: ['order'],
    handler: (consumer) => (message) => {
      console.log('consumer (order) received message')
      console.log(message.value.toString())
      consumer.commit(message)
    }
  })

  const inventoryConsumer = await Consumer({
    metadataBrokerList,
    consumerGroupId: 'inventory',
    topicNames: ['order', 'inventory'],
    handler: (consumer) => (message) => {
      console.log('consumer (inventory) received message')
      console.log(message.value.toString())
      const data = {
        type: 'event',
        action: 'update',
        payload: {
          'id': 'INVENTORY_001'
        }
      }
      const nextMessage = new Buffer(JSON.stringify(data))
      producer.produce('inventory_updated', -1, nextMessage, 'INVENTORY_001')
      consumer.commit(message)
    }
  })

  const deliveryConsumer = await Consumer({
    metadataBrokerList,
    consumerGroupId: 'delivery',
    topicNames: ['delivery', 'inventory_updated'],
    handler: (consumer) => (message) => {
      console.log('consumer (delivery) received message')
      console.log(message.value.toString())
      consumer.commit(message)
    }
  })

  consumers.orderConsumer = orderConsumer
  consumers.inventoryConsumer = inventoryConsumer
  consumers.deliveryConsumer = deliveryConsumer
}

module.exports = {
  defineConsumers,
  getConsumers: () => consumers
}
