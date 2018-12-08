const Producer = require('./Producer')
const config = require('../config')

const producers = {}

async function defineProducers() {
  try {
    const metadataBrokerList = config.get('kafka.metadataBrokerList')
  const producer = await Producer({ metadataBrokerList })
    producers.producer = producer
    return producers
  } catch (error) {
    console.log('Error: could not startProducers ', error.message)
  }
}

module.exports = {
  defineProducers,
  getProducers: () => producers,
  getProducer: () => producers.producer
}
