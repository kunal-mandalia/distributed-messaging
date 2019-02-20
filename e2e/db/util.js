async function dropDatabase (db) {
  const dbo = db.db('distributed-messaging')
  const dbCollections = await dbo.collections()
  const collectionsName = dbCollections.map(collection => collection.s.name)
  const dropCollections = collectionsName.map(collection =>
    dbo.collection(collection).drop()
  )
  return Promise.all(dropCollections)
}

module.exports = {
  dropDatabase
}
