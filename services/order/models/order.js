const db = require('./db')

const Order = db.model('Order', {
  id: {
    type: String,
    unique: true
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
    status: String
  }]
})

module.exports = Order
