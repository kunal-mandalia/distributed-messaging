const router = require('express').Router()
const { Order } = require('./models')
const { getProducer } = require('./kafka/producers')

// TODO: separate imeplementation from route
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const order = await Order.find({ id })
    return res.status(200).json({ order })
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
})

// TODO: trigger mutations only from Commands
router.post('/', async (req, res) => {
  try {
    // TODO: use user provided order payload
    // TODO: publish Event that an order was created

    // console.log(">>> producer", producer)
    // console.log(">>> ready", ready)
    const aggregateKey = 'CUSTOMER_001'
    const message = new Buffer('Message produced by Post Order service')

    const producer = getProducer()
    producer.produce('order', -1, message, aggregateKey)
    // console.log(">>> producer", producer)
    // console.log(">>> consumer", consumer)


    // producer.produce('test2', -1, message, aggregateKey)
    // const order = {
    //   id: 'ORDER-001',
    //   customerId: 'CUSTOMER-001',
    //   totalPrice: 10,
    //   totalQuantity: 2,
    //   items: [
    //     {
    //       productId: 'PRODUCT-001',
    //       price: 2,
    //       quantity: 1
    //     },
    //     {
    //       productId: 'PRODUCT-002',
    //       price: 8,
    //       quantity: 1
    //     }
    //   ]
    // }
    // const result = await Order.create(order)
    return res.status(200).json()
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
})

module.exports = router
