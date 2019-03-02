const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'

async function connect () {
  return new Promise(resolve => {
    MongoClient.connect(url, {
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
