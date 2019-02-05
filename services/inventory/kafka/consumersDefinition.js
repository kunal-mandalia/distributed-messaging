const axios = require('axios')
const uuidv4 = require('uuid/v4')
const { Inventory } = require('../models')
const config = require('../config')
const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP, TOPIC_MAP, CONSUMER_GROUP_MAP } = require('../../shared/constants')

const { ORDER, INVENTORY } = RESOURCE_MAP
const { CREATED, UPDATED } = OPERATION_MAP
const { EVENT } = MESSAGE_TYPE_MAP

/**
 *
 * @param {*} param0
 * @returns {object} processedMessage
 */
async function updateInventories ({ eventId, order }) {
  let processedMessage = null

  const quantitySoldByProductId = order.items.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.productId]: cur.quantity
    }
  }, {})

  const inventories = await Inventory.find({
    productId: { $in: Object.keys(quantitySoldByProductId) }
  })

  const processedInventory = inventories.find(inventory => {
    processedMessage = inventory.processedMessages.find(processedMessage => {
      return processedMessage.id === eventId
    })
    return processedMessage
  })

  if (processedInventory) {
    return processedMessage
  }

  processedMessage = { id: eventId, eventId: uuidv4(), operation: UPDATED }
  const inventoryUpdates = inventories.map(inventory => {
    return Inventory.updateOne(
      {
        productId: inventory.productId
      },
      {
        quantity: inventory.quantity - quantitySoldByProductId[inventory.productId],
        processedMessages: [...inventory.processedMessages, processedMessage]
      }
    )
  })
  await Promise.all(inventoryUpdates)
  return processedMessage
}

const consumersDefinition = [
  {
    consumerGroupId: CONSUMER_GROUP_MAP.INVENTORY,
    topicNames: [TOPIC_MAP.ORDER],
    handler: producer => consumer => async message => {
      console.log(`consumer [inventory-service-consumer] received message`)

      try {
        const decodedMessage = decodeMessage(message)
        const { id, aggregateId, resource, operation } = decodedMessage

        if (resource === ORDER) {
          if (operation === CREATED) {
            const query = await axios.get(`${config.get('services.order.address')}/order/${aggregateId}`)
            const { order } = query.data

            if (!order) {
              console.log(`order ${aggregateId} not found`)
              return
            } else {
              const processedMessage = await updateInventories({
                eventId: id,
                order
              })

              const eventMessage = encodeMessage({
                id: processedMessage.eventId,
                aggregateId,
                resource: INVENTORY,
                operation: processedMessage.operation,
                type: EVENT
              })
              producer.produce(TOPIC_MAP.INVENTORY, -1, eventMessage, aggregateId)
            }
          }
        }

        consumer.commitMessage(message)
      } catch (error) {
        console.log(`${error.message}`)
        throw error
      }
    }
  }
]

module.exports = consumersDefinition
