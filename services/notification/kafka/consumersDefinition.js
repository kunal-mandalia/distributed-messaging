const WebSocket = require('ws')
const { decodeMessage } = require('../../shared/kafka/message')
const { TOPIC_MAP, CONSUMER_GROUP_MAP } = require('../../shared/constants')

const generateConsumersDefinition = (wss) => {
  return [
    {
      consumerGroupId: CONSUMER_GROUP_MAP.NOTIFICATION,
      topicNames: [TOPIC_MAP.ORDER],
      handler: producer => consumer => async message => {
        const decodedMessage = decodeMessage(message)
        console.log(`consumer [notification-service-consumer] received message on topic order`, decodedMessage)

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(decodedMessage))
          }
        })
      }
    },
    {
      consumerGroupId: CONSUMER_GROUP_MAP.NOTIFICATION,
      topicNames: [TOPIC_MAP.INVENTORY],
      handler: producer => consumer => async message => {
        const decodedMessage = decodeMessage(message)
        console.log(`consumer [notification-service-consumer] received message on topic inventory`, decodedMessage)

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(decodedMessage))
          }
        })
      }
    }
  ]
}

module.exports = {
  generateConsumersDefinition
}
