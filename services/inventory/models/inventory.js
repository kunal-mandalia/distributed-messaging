const db = require('./db')

const Inventory = db.model('Inventory', {
  inventoryId: {
    type: String,
    unique: true
  },
  productId: String,
  quantity: Number,
  processedMessages: [{
    id: String,
    eventId: String,
    operation: String,
    subject: String,
    data: Object
  }]
})

module.exports = Inventory
