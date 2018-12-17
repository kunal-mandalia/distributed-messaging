const db = require('./db')

const Inventory = db.model('Inventory', {
  id: {
    type: String,
    unique: true
  },
  productId: String,
  quantity: Number,
})

module.exports = Inventory
