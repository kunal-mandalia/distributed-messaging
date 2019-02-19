const db = require('./db')
const { ORDER_STATUS_MAP } = require('../constants')

const { PENDING, RESERVED, COMPLETE } = ORDER_STATUS_MAP

const Order = db.model('Order', {
  orderId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: [
      PENDING,
      RESERVED,
      COMPLETE
    ]
  },
  customerId: String,
  totalPrice: Number,
  totalQuantity: Number,
  items: [{
    productId: String,
    price: Number,
    quantity: Number
  }],
  processedMessages: [{
    id: String,
    eventId: String,
    operation: String,
    subject: String,
    data: Object
  }]
})

module.exports = Order
