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
    default: 8903,
    env: 'APP_PORT',
    arg: 'port'
  },
  webSocketPort: {
    doc: 'The websocket port to bind.',
    format: 'port',
    default: 8904,
    env: 'APP_PORT_WEBSOCKET',
    arg: 'websocket-port'
  },
  kafka: {
    metadataBrokerList: {
      doc: 'The connection string to the Kafka broker.',
      format: String,
      default: '0.0.0.0:9092',
      env: 'KAFKA_METADATA_BROKER_LIST'
    }
  }
})

config.validate({ allowed: 'strict' })

module.exports = config
