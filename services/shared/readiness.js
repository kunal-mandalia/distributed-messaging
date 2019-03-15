class Readiness {
  constructor () {
    this.services = {}
  }

  set (service, isReady) {
    if (!this.services[service]) {
      this.services[service] = {
        isReady
      }
    } else {
      this.services[service].isReady = isReady
    }
  }

  get (service) {
    return this.services[service]
  }

  getIsReady (service) {
    return this.services[service] && this.services[service].isReady === true
  }
}

const readiness = new Readiness()
module.exports = { readiness }
