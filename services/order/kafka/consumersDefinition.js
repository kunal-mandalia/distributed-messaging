const uuidv4 = require('uuid/v4')
const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../shared/constants')
const { Order } = require('../models')

const { ORDER } = RESOURCE_MAP
const { CREATE, CREATED } = OPERATION_MAP
const { COMMAND, EVENT } = MESSAGE_TYPE_MAP

/**
 *
 * @param {Object} decodedMessage
 * @returns {Object} processedMessage { id, status }
 */
async function createOrder (decodedMessage) {
  const { id, payload } = decodedMessage
  const { order } = payload

  const existingOrder = await Order.findOne({
    'processedMessages.id': id
  })

  console.log(`existing order ${existingOrder}`)

  if (existingOrder) {
    console.log(`already processed message ${id} [idempotent]`)
    return existingOrder.processedMessages.find(m => m.id === id)
  }

  const processedMessage = { id, eventId: uuidv4() }
  const orderPayload = {
    ...order,
    processedMessages: [processedMessage]
  }
  console.log(`creating order: `, JSON.stringify(orderPayload, null, 4))

  await Order.create(orderPayload)
  return processedMessage
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
        const { status, eventId } = await createOrder(decodedMessage)

        const eventMessage = encodeMessage({
          id: eventId,
          status,
          aggregateId,
          resource: ORDER,
          operation: CREATED,
          type: EVENT,
          payload
        })
        producer.produce('order', -1, eventMessage, aggregateId)
      }
      await consumer.commitMessage(message)
    }
  }
]

module.exports = consumersDefinition
