const { exec } = require('child_process')

async function stopContainer (container) {
  return new Promise((resolve, reject) => {
    exec(`./scripts/stopContainer.sh ${container}`, {}, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      return resolve(stdout)
    })
  })
}

async function startContainer (container, address) {
  return new Promise((resolve, reject) => {
    exec(`./scripts/startContainer.sh ${container} ${address}`, {}, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      return resolve(stdout)
    })
  })
}

module.exports = {
  startContainer,
  stopContainer
}
