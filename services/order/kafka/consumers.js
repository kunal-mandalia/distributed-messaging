const consumersDefinition = [
  {
    consumerGroupId: 'order-service-consumer',
    topicNames: ['order'],
    handler: db => producer => consumer => async message => {
      console.log('order-service-consumer received message')
      console.log(message.value.toString())
    }
  }
]

module.exports = consumersDefinition
