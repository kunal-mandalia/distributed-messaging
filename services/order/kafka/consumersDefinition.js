const uuidv4 = require('uuid/v4')
const { Order } = require('../models')
const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP, TOPIC_MAP, CONSUMER_GROUP_MAP, SUBJECT_MAP } = require('../../shared/constants')
const { ORDER_STATUS_MAP } = require('../constants')

const { ORDER } = RESOURCE_MAP
const { CREATED, UPDATED } = OPERATION_MAP
const { EVENT } = MESSAGE_TYPE_MAP
const { PENDING, RESERVED } = ORDER_STATUS_MAP
const { ORDER_CREATE, ORDER_CREATED, INVENTORY_RESERVED } = SUBJECT_MAP

/**
 *
 * @param {Object} decodedMessage
 * @returns {Object} processedMessage { id, eventId }
 */
async function createOrder (decodedMessage) {
  const { id, data } = decodedMessage
  const { order } = data

  const existingOrder = await Order.findOne({
    'processedMessages.id': id
  })

  if (existingOrder) {
    return existingOrder.processedMessages.find(m => m.id === id)
  }

  const processedMessage = {
    id,
    eventId: uuidv4(),
    operation: CREATED,
    subject: ORDER_CREATED,
    data: order
  }
  const orderPayload = {
    ...order,
    status: PENDING,
    processedMessages: [processedMessage]
  }
  await Order.create(orderPayload)
  return processedMessage
}

async function updateOrderStatus (decodedMessage) {
  const { id, aggregateId } = decodedMessage

  const processedOrder = await Order.findOne({
    'processedMessages.id': id
  })

  if (processedOrder) {
    return processedOrder.processedMessages.find(m => m.id === id)
  }

  const processedMessage = {
    id,
    eventId: uuidv4(),
    operation: UPDATED,
    subject: INVENTORY_RESERVED,
    data: { status: RESERVED }
  }
  const order = await Order.findOne({ orderId: aggregateId })
  await Order.updateOne({
    orderId: aggregateId
  }, {
    status: RESERVED,
    processedMessages: [...order.processedMessages, processedMessage]
  })
  return processedMessage
}

const consumersDefinition = [
  {
    consumerGroupId: CONSUMER_GROUP_MAP.ORDER,
    topicNames: [TOPIC_MAP.ORDER],
    handler: producer => consumer => async message => {
      console.log('order-service-consumer received message on order topic')

      const decodedMessage = decodeMessage(message)
      const { aggregateId, subject } = decodedMessage

      if (subject === ORDER_CREATE) {
        const processedMessage = await createOrder(decodedMessage)

        const eventMessage = encodeMessage({
          id: processedMessage.eventId,
          operation: processedMessage.operation,
          subject: processedMessage.subject,
          data: processedMessage.data,
          aggregateId,
          resource: ORDER,
          type: EVENT
        })
        producer.produce(TOPIC_MAP.ORDER, -1, eventMessage, aggregateId)
      }
      await consumer.commitMessage(message)
    }
  },
  {
    consumerGroupId: CONSUMER_GROUP_MAP.ORDER,
    topicNames: [TOPIC_MAP.INVENTORY],
    handler: producer => consumer => async message => {
      console.log('order-service-consumer received message on inventory topic')

      const decodedMessage = decodeMessage(message)
      const { aggregateId, subject } = decodedMessage

      if (subject === INVENTORY_RESERVED) {
        // what if inventory could be updated by multiple
        // causes e.g. stock_reserved, stock_replenished
        // subject: INVENTORY_RESERVED
        // subject: INVENTORY_REPLENISHED
        // subject: INVENTORY_RESERVE_FAILED
        const processedMessage = await updateOrderStatus(decodedMessage)

        const eventMessage = encodeMessage({
          id: processedMessage.eventId,
          subject: processedMessage.subject,
          data: processedMessage.data,
          operation: processedMessage.operation,
          aggregateId,
          resource: ORDER,
          type: EVENT
        })
        producer.produce(TOPIC_MAP.ORDER, -1, eventMessage, aggregateId)
      }
      await consumer.commitMessage(message)
    }
  }
]

module.exports = consumersDefinition
