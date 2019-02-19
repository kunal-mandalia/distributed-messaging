const uuidv4 = require('uuid/v4')
const { Inventory } = require('../models')
const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP, TOPIC_MAP, CONSUMER_GROUP_MAP, SUBJECT_MAP } = require('../../shared/constants')

const { INVENTORY } = RESOURCE_MAP
const { UPDATED } = OPERATION_MAP
const { EVENT } = MESSAGE_TYPE_MAP
const { ORDER_CREATED, INVENTORY_RESERVED } = SUBJECT_MAP

/**
 *
 * @param {*} param0
 * @returns {object} processedMessage
 */
async function updateInventories ({ eventId, order }) {
  let processedMessage = null
  let data = { inventories: [] }

  const quantitySoldByProductId = order.items.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.productId]: cur.quantity
    }
  }, {})

  const inventories = await Inventory.find({
    productId: { $in: Object.keys(quantitySoldByProductId) }
  })

  const processedInventories = inventories.filter(inventory => {
    processedMessage = inventory.processedMessages.find(processedMessage => {
      return processedMessage.id === eventId
    })
    return processedMessage
  })

  if (processedInventories.length > 0) {
    const { id, eventId, operation, subject } = processedMessage
    const data = {
      inventories: processedInventories.map(processedInventory => {
        return {
          inventoryId: processedInventory.inventoryId,
          productId: processedInventory.productId,
          quantity: processedInventory.quantity
        }
      })
    }

    return {
      id,
      eventId,
      operation,
      subject,
      data
    }
  }

  const nextEventId = uuidv4()
  const inventoryUpdates = inventories.map(inventory => {
    const updatedInventory = {
      productId: inventory.productId,
      quantity: inventory.quantity - quantitySoldByProductId[inventory.productId]
    }
    const processedInventoryMessage = {
      id: eventId,
      eventId: nextEventId,
      subject: INVENTORY_RESERVED,
      operation: UPDATED,
      data: updatedInventory
    }
    data.inventories.push(updatedInventory)
    return Inventory.updateOne(
      {
        productId: inventory.productId
      },
      {
        quantity: inventory.quantity - quantitySoldByProductId[inventory.productId],
        processedMessages: [...inventory.processedMessages, processedInventoryMessage]
      }
    )
  })

  processedMessage = {
    id: eventId,
    eventId: uuidv4(),
    operation: UPDATED,
    subject: INVENTORY_RESERVED,
    data
  }
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
        const { id, aggregateId, subject, data } = decodedMessage

        if (subject === ORDER_CREATED) {
          if (!data) {
            console.log(`order ${aggregateId} not found`)
            return
          } else {
            const processedMessage = await updateInventories({
              eventId: id,
              order: data
            })

            const eventMessage = encodeMessage({
              id: processedMessage.eventId,
              operation: processedMessage.operation,
              subject: processedMessage.subject,
              data: processedMessage.data,
              aggregateId,
              resource: INVENTORY,
              type: EVENT
            })
            producer.produce(TOPIC_MAP.INVENTORY, -1, eventMessage, aggregateId)
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
