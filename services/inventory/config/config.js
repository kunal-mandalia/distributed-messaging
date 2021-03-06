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
    default: 8901,
    env: 'APP_PORT',
    arg: 'port'
  },
  mongo: {
    connectionString: {
      doc: 'The connection string including db name.',
      format: String,
      default: 'mongodb://0.0.0.0:27017/distributed-messaging',
      env: 'DB_MONGO_CONNECTION_STRING'
    }
  },
  kafka: {
    metadataBrokerList: {
      doc: 'The connection string to the Kafka broker.',
      format: String,
      default: '0.0.0.0:9092',
      env: 'KAFKA_METADATA_BROKER_LIST'
    }
  },
  enableAutomationTesting: {
    doc: 'Enable helpers for resetting db.',
    format: Boolean,
    default: true,
    env: 'ENABLE_AUTOMATION'
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
