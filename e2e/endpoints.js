const env = process.env.CONFIG_ENV === 'CI' ? 'CI' : 'local'

const endpoints = {
  CI: {
    apiGateway: 'http://api-gateway:8090',
    notification: 'ws://notification:8094',
    mongo: 'mongodb://mongo:27017/'
  },
  local: {
    apiGateway: 'http://0.0.0.0:8900',
    notification: 'ws://0.0.0.0:8904',
    mongo: 'mongodb://localhost:27017/'
  }
}

module.exports = endpoints[env]
