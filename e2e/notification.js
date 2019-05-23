class Notification {
  constructor (data) {
    this.data = []
    this.maxTimeout = 5000
    this.delayDuration = 25

    this.getData = this.getData.bind(this)
    this.getCount = this.getCount.bind(this)
    this.append = this.append.bind(this)
    this.reset = this.reset.bind(this)
    this.delay = this.delay.bind(this)
    this.waitUntilReceived = this.waitUntilReceived.bind(this)
    this.waitUntil = this.waitUntil.bind(this)
    this.comparatorCount = this.comparatorCount.bind(this)

    this.wait = {
      until: {
        message: {
          count: async (count) => {
            await this.waitUntil(this.comparatorCount(count))
          }
        }
      }
    }

    this.message = {
      includes: {
        subject: this.includesSubject.bind(this),
        ordered: {
          subjects: this.includesOrderedSubjects.bind(this),
          attributes: this.includesOrderedAttributes.bind(this)
        }
      }
    }
  }

  getData () {
    return this.data
  }

  getCount () {
    return this.data.length
  }

  append (notification) {
    try {
      this.data.push(JSON.parse(notification))
    } catch (e) {
      console.log(e.message)
    }
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

  async waitUntil (comparator) {
    const { maxTimeout, getData, delayDuration, delay } = this
    let totalDelayTime = 0
    let messages = getData()

    return new Promise(async (resolve, reject) => {
      while (!comparator(messages)) {
        if (totalDelayTime > maxTimeout) {
          const error = new Error(`fn waitForNotifications did not receive messages in time`)
          reject(error)
        }
        messages = getData()
        await delay(delayDuration)
      }
      resolve()
    })
  }

  includesSubject (subject) {
    return this.data.some(n => n.subject === subject)
  }

  includesOrderedSubjects (subjects) {
    let prevMessageIndex = -Infinity
    const messages = this.data
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i]
      const index = messages.findIndex(message => message.subject === subject)
      if (index === -1 || index < prevMessageIndex) {
        return false
      }
      prevMessageIndex = index
    }
    return true
  }

  includesOrderedAttributes (attributesList) {
    let prevMessageIndex = -Infinity
    const messages = this.data
    for (let i = 0; i < attributesList.length; i++) {
      const attributes = attributesList[i]
      const attributeKeys = Object.keys(attributes)
      const index = messages.findIndex(message => {
        return attributeKeys.every(attributeKey => message[attributeKey] === attributes[attributeKey])
      })
      if (index === -1 || index < prevMessageIndex) {
        return false
      }
      prevMessageIndex = index
    }
    return true
  }

  received (count) {
    this.waitUntilReceived()
  }

  comparatorCount (count) {
    return function (messages) {
      return messages.length === count
    }
  }
}

const notification = new Notification()
module.exports = {
  notification
}
