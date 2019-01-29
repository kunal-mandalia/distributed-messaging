const router = require('express').Router()
const { Order } = require('../../models')
const { getProducer } = require('../../../shared/kafka/producers')
const { encodeMessage } = require('../../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../../shared/constants')

const { ORDER } = RESOURCE_MAP
const { CREATE } = OPERATION_MAP
const { COMMAND } = MESSAGE_TYPE_MAP

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
  console.log(`order post ${JSON.stringify(order)}`)
  try {
    const producer = getProducer()
    const message = encodeMessage({
      id: order.id,
      aggregateId: order.orderId,
      resource: ORDER,
      operation: CREATE,
      type: COMMAND,
      payload: { order }
    })
    producer.produce('order', -1, message, order.orderId)
    return res.status(200).json({ order })
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
})

module.exports = router
