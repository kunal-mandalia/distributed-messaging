const mongoose = require('mongoose')
const config = require('../config')

const delayShutdown = (ms = 5000) => new Promise(resolve => {
  setTimeout(() => {
    resolve()
  }, ms)
})

mongoose.connect(config.get('mongo.connectionString'), {
  useNewUrlParser: true
}, async (error) => {
  if (error) {
    console.log(`
      Could not connect to db.
      Error: ${error.message}
      Exiting...`
    )
    await delayShutdown()
    process.exit(1)
  }
})

module.exports = mongoose
