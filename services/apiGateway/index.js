const service = require('./service')

if (module.id === require.main.id) {
  service.start()
}

module.exports = service