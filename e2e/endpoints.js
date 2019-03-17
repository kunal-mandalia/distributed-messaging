const env = process.env.CONFIG_ENV === 'CI' ? 'CI' : 'local'

const endpoints = {
  CI: {
    apiGateway: 'http://localhost:8090',
    notification: 'ws://localhost:8094',
    mongo: 'mongodb://localhost:27017/'
  },
  local: {
    apiGateway: 'http://0.0.0.0:8900',
    notification: 'ws://0.0.0.0:8904',
    mongo: 'mongodb://localhost:27017/'
  }
}

module.exports = endpoints[env]
