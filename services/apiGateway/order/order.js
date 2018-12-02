const router = require('express').Router()
const axios = require('axios')
const config = require('../config')

const orderServiceAddress = config.get('services.order.address')

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const order = await axios.get(`${orderServiceAddress}/${id}`)
    return res.status(order.status).json({
      order: order.data
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

module.exports = { router }
