const axios = require('axios')
const uuidv4 = require('uuid/v4')
const { Inventory } = require('../models')
const config = require('../config')
const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../shared/constants')

const { ORDER, INVENTORY } = RESOURCE_MAP
const { CREATED, UPDATED } = OPERATION_MAP
const { EVENT } = MESSAGE_TYPE_MAP

/**
 *
 * @param {*} param0
 * @returns {string} processed message status: 'success' | 'failure' | 'pending' | 'ignored'
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

  // check if message has already been processed
  const processedInventory = inventories.find(inventory => {
    processedMessage = inventory.processedMessages.find(processedMessage => {
      return processedMessage.id === eventId
    })
    return processedMessage
  })

  console.log(`processedInventory ${processedInventory}`)
  if (processedInventory) {
    return processedMessage
  }

  processedMessage = { id: eventId, eventId: uuidv4() }
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
  // what happens if this fails?
  // event message not produced
  await Promise.all(inventoryUpdates)
  console.log(`
    updated ${inventoryUpdates.length} inventories
    processedMessage ${JSON.stringify(processedMessage, null, 4)}
  `)
  return processedMessage
}

const consumersDefinition = [
  {
    consumerGroupId: 'inventory-service-consumer',
    topicNames: ['order'],
    handler: producer => consumer => async message => {
      try {
        const decodedMessage = decodeMessage(message)
        const { id, aggregateId, resource, operation } = decodedMessage

        console.log(`consumer [inventory-service-consumer] received message ${JSON.stringify(decodedMessage, null, 4)}`)

        if (resource === ORDER) {
          if (operation === CREATED) {
            // order must exist
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
                operation: UPDATED,
                type: EVENT
              })
              producer.produce('inventory', -1, eventMessage, aggregateId)
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
