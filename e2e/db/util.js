async function dropCollections (db) {
  const dbo = db.db('distributed-messaging')
  const dbCollections = await dbo.collections()
  const collectionsName = dbCollections.map(collection => collection.s.name)
  const dropCollections = collectionsName.map(collection =>
    dbo.collection(collection).drop()
  )
  return Promise.all(dropCollections)
}

async function seedDatabase (db) {
  const dbo = db.db('distributed-messaging')
  const collections = ['inventories', 'orders']
  collections.forEach(async collection => {
    await dbo.createCollection(collection)
  })
}

async function delay (ms = 1000) {
  return new Promise(resolve => {
    setTimeout(() => { resolve() }, ms)
  })
}

module.exports = {
  dropCollections,
  seedDatabase,
  delay
}
