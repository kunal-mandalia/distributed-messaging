const axios = require('axios')
const { Inventory } = require('../models')
const config = require('../config')
const { encodeMessage, decodeMessage, getDecodedMessageId } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../shared/constants')

const { ORDER, INVENTORY } = RESOURCE_MAP
const { CREATED, UPDATED } = OPERATION_MAP
const { EVENT } = MESSAGE_TYPE_MAP

/**
 *
 * @param {*} param0
 * @returns {string} processed message status: 'success' | 'failure' | 'pending' | 'ignored'
 */
async function updateInventories ({ messageId, order }) {
  const quantitySoldByProductId = order.items.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.productId]: cur.quantity
    }
  }, {})

  const inventories = await Inventory.find({
    productId: { $in: Object.keys(quantitySoldByProductId) }
    // processedMessages: { $ne: messageId }
  })

  // check if message has already been processed
  const processedInventory = inventories.find(inventory => {
    return inventory.processedMessages.find(processedMessage => {
      return processedMessage.id === messageId
    })
  })

  console.log(`processedInventory ${processedInventory}`)
  if (processedInventory) {
    return processedInventory.status
  }

  const inventoryUpdates = inventories.map(inventory => {
    return Inventory.updateOne(
      {
        productId: inventory.productId
      },
      {
        quantity: inventory.quantity - quantitySoldByProductId[inventory.productId],
        processedMessages: [...inventory.processedMessages, { id: messageId, status: 'success' }]
      }
    )
  })
  // what happens if this fails?
  // event message not produced
  await Promise.all(inventoryUpdates)
  console.log(`updated ${inventoryUpdates.length} inventories`)
}

const consumersDefinition = [
  {
    consumerGroupId: 'inventory-service-consumer',
    topicNames: ['order'],
    handler: producer => consumer => async message => {
      try {
        const decodedMessage = decodeMessage(message)
        const { aggregateId, resource, operation } = decodedMessage
        const messageId = getDecodedMessageId(decodedMessage)
        let processedMessageStatus = 'pending'

        console.log(`consumer [inventory-service-consumer] received message ${messageId}`)

        if (resource === ORDER) {
          if (operation === CREATED) {
            // order must exist
            const query = await axios.get(`${config.get('services.order.address')}/order/${aggregateId}`)
            const { order } = query.data

            if (!order) {
              console.log(`order ${aggregateId} not found`)
              processedMessageStatus = 'bad_request'
            } else {
              // update inventories idempotently
              processedMessageStatus = await updateInventories({
                messageId,
                order
              })
            }
          }
        }

        const eventMessage = encodeMessage({
          aggregateId,
          resource: INVENTORY,
          operation: UPDATED,
          type: EVENT,
          status: processedMessageStatus
        })
        producer.produce('inventory', -1, eventMessage, aggregateId)
        consumer.commitMessage(message)
      } catch (error) {
        console.log(`${error.message}`)
        throw error
      }
    }
  }
]

module.exports = consumersDefinition
