const router = require('express').Router()
const db = require('../../models/db')
const { Order } = require('../../models')
const { getProducer } = require('../../../shared/kafka/producers')

async function createOrder(order, session) {
  await Order.create([order], { session })
}

router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const order = await Order.findOne({ id })
    return res.status(200).json({ order })
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
})

router.post('/', async (req, res) => {
  const { order } = req.body
  let session = {}
  try {
    session = await db.startSession()
    await session.startTransaction()

    const producer = getProducer()

    await createOrder(order, session)

    const message = {
      aggregateId: order.id,
      resource: 'ORDER',
      operation: 'CREATED',
    }
    const kafkaMessage = new Buffer(JSON.stringify(message))
    producer.produce('order', -1, kafkaMessage, message.aggregateId)

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ order })
  } catch (error) {
    if (typeof session.abortTransaction === "function") {
      await session.abortTransaction()
    }
    return res.status(400).json({
      message: error.message
    })
  }
})

module.exports = router
