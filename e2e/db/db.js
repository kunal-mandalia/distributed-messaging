const MongoClient = require('mongodb').MongoClient
const endpoints = require('../endpoints')

async function connect () {
  return new Promise(resolve => {
    MongoClient.connect(endpoints.mongo, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err
      resolve(db)
    })
  })
}

module.exports = {
  connect
}
