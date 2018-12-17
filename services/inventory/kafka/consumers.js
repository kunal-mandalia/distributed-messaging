const axios = require('axios')
const { Inventory } = require('../models')
const db = require('../models/db')
const config = require('../config')

async function updateInventories(order, session) {
  const quantitySoldByProductId = order.items.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.productId]: cur.quantity
    }
  }, {})
  const inventories = await Inventory.find({ productId: { $in: Object.keys(quantitySoldByProductId) } })

  const inventoryUpdates = inventories.map(inventory => {
    return Inventory.updateOne(
      { productId: inventory.productId },
      { quantity: inventory.quantity - quantitySoldByProductId[inventory.productId] },
      { session })
  })

  await Promise.all(inventoryUpdates)
}

const consumersDefinition = [
  {
    consumerGroupId: 'inventory-service-consumer',
    topicNames: ['order'],
    handler: producer => consumer => async message => {
      let session = null
      try {
        console.log('consumer [inventory-service-consumer] received message')
        session = await db.startSession()
        await session.startTransaction()
  
        const { aggregateId, resource, operation } = JSON.parse(message.value.toString())
        console.log(aggregateId, resource, operation)
  
        if (resource === "ORDER") {
          if (operation === "CREATED") {
            const query = await axios.get(`${config.get('services.order.address')}/order/${aggregateId}`)
            const { order } = query.data

            if (!order) {
              console.log(`order ${aggregateId} not found`)
            } else {
              await updateInventories(order, session)
            }
          }
        }
  
        const nextMessage = {
          aggregateId,
          resource: 'INVENTORY',
          operation: 'UPDATED',
        }
        const kafkaMessage = new Buffer(JSON.stringify(nextMessage))
        producer.produce('inventory', -1, kafkaMessage, message.aggregateId)

        await session.commitTransaction()
        consumer.commitMessage(message)
        session.endSession()

      } catch (error) {
        if (session.abortTransaction && typeof session.abortTransaction === "function") {
          await session.abortTransaction()
        }
        throw error
      }
    }
  }
]

module.exports = consumersDefinition