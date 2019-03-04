const convict = require('convict')

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  hostname: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'APP_HOSTNAME'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8900,
    env: 'APP_PORT',
    arg: 'port'
  },
  services: {
    order: {
      address: {
        doc: 'Order service address',
        format: String,
        default: 'http://0.0.0.0:8902',
        env: 'SERVICE_ADDRESS_ORDER',
        arg: 'address'
      }
    }
  }
})

config.validate({ allowed: 'strict' })

module.exports = config
