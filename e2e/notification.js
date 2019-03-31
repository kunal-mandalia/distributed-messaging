class Notification {
  constructor (data) {
    this.data = []
    this.maxTimeout = 60000
    this.delayDuration = 25

    this.getData = this.getData.bind(this)
    this.getCount = this.getCount.bind(this)
    this.append = this.append.bind(this)
    this.reset = this.reset.bind(this)
    this.delay = this.delay.bind(this)
    this.waitUntilReceived = this.waitUntilReceived.bind(this)
  }

  getData () {
    return this.data
  }

  getCount () {
    return this.data.length
  }

  append (notification) {
    this.data.push(notification)
  }

  reset () {
    this.data = []
  }

  async delay (ms = 25) {
    return new Promise(resolve => {
      setTimeout(() => { resolve() }, ms)
    })
  }

  async waitUntilReceived (count) {
    const { maxTimeout, getCount, delayDuration, delay } = this
    let totalDelayTime = 0
    let notificationCount = getCount()

    return new Promise(async (resolve, reject) => {
      while (notificationCount < count) {
        if (totalDelayTime > maxTimeout) {
          const error = new Error(`fn waitForNotifications did not receive messages in time`)
          reject(error)
        }
        notificationCount = getCount()
        await delay(delayDuration)
      }
      resolve()
    })
  }
}

const notification = new Notification()
module.exports = {
  notification
}
