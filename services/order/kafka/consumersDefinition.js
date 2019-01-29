const { encodeMessage, decodeMessage, getDecodedMessageId } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../shared/constants')
const { Order } = require('../models')

const { ORDER } = RESOURCE_MAP
const { CREATE, CREATED } = OPERATION_MAP
const { COMMAND, EVENT } = MESSAGE_TYPE_MAP

async function createOrder (decodedMessage) {
  const { order } = decodedMessage.payload
  const messageId = getDecodedMessageId(decodedMessage)

  const existingOrder = await Order.findOne({
    processedMessages: messageId
  })

  console.log(`existing order ${existingOrder}`)

  if (existingOrder) {
    console.log(`already processed message ${messageId} [idempotent]`)
    return
  }

  await Order.create({
    ...order,
    processedMessages: [messageId]
  })
}

const consumersDefinition = [
  {
    consumerGroupId: 'order-service-consumer',
    topicNames: ['order'],
    handler: producer => consumer => async message => {
      console.log('order-service-consumer received message')
      console.log(message)
      console.log(message.value.toString())

      const decodedMessage = decodeMessage(message)
      const { aggregateId, operation, type, payload } = decodedMessage

      if (operation === CREATE && type === COMMAND) {
        await createOrder(decodedMessage)

        const eventMessage = encodeMessage({
          aggregateId,
          resource: ORDER,
          operation: CREATED,
          type: EVENT,
          payload
        })
        producer.produce('order', -1, eventMessage, aggregateId)

        await consumer.commitMessage(message)
        return
      }

      console.log(`ignoring messaging ${aggregateId}`)
    }
  }
]

module.exports = consumersDefinition
