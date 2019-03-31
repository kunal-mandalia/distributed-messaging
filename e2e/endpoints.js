const env = process.env.CONFIG_ENV === 'CI' ? 'CI' : 'local'

const endpoints = {
  CI: {
    apiGateway: 'http://api-gateway:8090',
    inventory: 'http://inventory:8091',
    order: 'http://order:8092',
    notification: 'ws://notification:8094',
    mongo: 'mongodb://mongo:27017/'
  },
  local: {
    apiGateway: 'http://localhost:8900',
    inventory: 'http://localhost:8901',
    order: 'http://localhost:8902',
    notification: 'ws://localhost:8904',
    mongo: 'mongodb://localhost:27017/'
  }
}

module.exports = endpoints[env]
