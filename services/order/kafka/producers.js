const Producer = require('./Producer')

const producers = {}

async function defineProducers() {
  try {
    const producer = await Producer()
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
