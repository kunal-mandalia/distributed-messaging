const db = require('./db')

const Order = db.model('Order', {
  id: String,
  customerId: String,
  totalPrice: Number,
  totalQuantity: Number,
  items: [{
    productId: String,
    price: Number,
    quantity: Number
  }]
})

module.exports = Order
