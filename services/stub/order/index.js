const app = require('express')()
const morgan = require('morgan')('tiny')

const hostname = process.env.APP_HOSTNAME || 'localhost'
const port = process.env.APP_PORT || 8080
let db = {}

app.use(morgan)

app.delete('/db', (req, res) => {
  db = {}
  return res.status(200).json({
    description: 'deleted db'
  })
})

app.post('/seed-data', (req, res) => {
  db = {
    ...db,
    'ORDER-001': {
      id: 'ORDER-001',
      products: [
        {
          id: 'PRODUCT-001',
          quantity: 2
        }
      ]
    }
  }
  return res.status(200).json({
    description: 'inserted seed data'
  })
})

app.get('/:id', (req, res) => {
    const id = req.params.id
    const order = db[id]
    if (order) {
      return res.status(200).json(order)
    }
    return res.status(204).json({
      description: 'order not found'
    })
})

app.listen(port, hostname, () => {
  console.log(`Stub Order service running on http://${hostname}:${port}`)
})
