async function delay (ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve()
    }, ms)
  })
}

async function readyOrDie ({ getIsReady, timeoutSeconds = 10, verifyFrequency = 1000 }) {
  const start = new Date()
  const killBy = start.setSeconds(start.getSeconds() + timeoutSeconds)
  console.log('readyOrDie invoked for', killBy)

  while (!getIsReady()) {
    await delay(verifyFrequency)
    const now = Date.now()

    if (now > killBy) {
      console.log(`readyOrDie exceeded timeout, exiting process`)
      process.exit(1)
    }
  }
}

module.exports = {
  delay,
  readyOrDie
}
