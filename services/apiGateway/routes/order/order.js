const router = require('express').Router()
const axios = require('axios')
const config = require('../../config')

const orderServiceAddress = config.get('services.order.address')

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const result = await axios.get(`${orderServiceAddress}/order/${id}`)
    return res.status(result.status).json({
      order: result.data
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { order } = req.body
    console.log(`api gateway received order ${JSON.stringify(order)}`)
    const result = await axios.post(`${orderServiceAddress}/order`, { order })
    return res.status(result.status).json({
      order
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

module.exports = { router }
