const db = require('./db')

const Inventory = db.model('Inventory', {
  id: {
    type: String,
    unique: true
  },
  productId: String,
  quantity: Number,
  processedMessages: [{
    id: String,
    eventId: String
  }]
})

module.exports = Inventory
