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
    default: '127.0.0.1',
    env: 'APP_HOSTNAME'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8903,
    env: 'APP_PORT',
    arg: 'port'
  },
  mongo: {
    connectionString: {
      doc: 'The connection string including db name.',
      format: String,
      default: 'mongodb://localhost:27017/distributed-messaging',
      env: 'DB_MONGO_CONNECTION_STRING'
    }
  },
  kafka: {
    metadataBrokerList: {
      doc: 'The connection string to the Kafka broker.',
      format: String,
      default: '127.0.0.1:9092',
      env: 'KAFKA_METADATA_BROKER_LIST'
    }
  }
})

config.validate({ allowed: 'strict' })

module.exports = config
