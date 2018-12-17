const router = require('express').Router()
const config = require('../config')
const { Inventory } = require('../models')

function deleteAllData() {
  return Inventory.deleteMany({})
}

function seedData() {
  return Inventory.bulkWrite([
    {
      insertOne: {
        "document": {
          id: "INVENTORY_001",
          productId: "PRODUCT_001",
          quantity: 10
        }
      }
    },
    {
      insertOne: {
        "document": {
          id: "INVENTORY_002",
          productId: "PRODUCT_002",
          quantity: 15
        }
      }
    },
  ])
}

router.get('/ready', (req, res) => {
  if (config.get('enableAutomationTesting') === true) {
    return res.status(200).json({
      description: 'automation-testing route ready'
    })

  } else {
    return res.status(404).json({
      description: 'automation-testing not enabled'
    })
  }
})

if (config.get('enableAutomationTesting') === true) {
  router.delete('/all', (req, res) => {
    deleteAllData()
      .then(result => {
        return res.status(200).json({
          description: `deleted all data from db: ${JSON.stringify(result)}`
        })
      })
      .catch(error => {
        return res.status(500).json({
          description: `error deleting all data: ${error.message}`
        })
      })
  })

  router.post('/seed', (req, res) => {
    seedData()
    .then(result => {
      return res.status(200).json({
        description: `inserted seed data: ${JSON.stringify(result)}`
      })
    })
    .catch(error => {
      return res.status(500).json({
        description: `error seeding data: ${error.message}`
      })
    })
  })
}

module.exports = router