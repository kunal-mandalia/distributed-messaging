const convict = require('convict')

const config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  hostname: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "APP_HOSTNAME",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "APP_PORT",
    arg: "port"
  },
  mongo: {
    connectionString: {
      doc: "The connection string including db name.",
      format: String,
      default: "mongodb://127.0.0.1:27017/distributed-messaging",
      env: "DB_MONGO_CONNECTION_STRING"
    }
  }
})

config.validate({allowed: 'strict'})

module.exports = config