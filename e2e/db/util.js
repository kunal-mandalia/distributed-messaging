async function dropCollections (db) {
  const dbo = db.db('distributed-messaging')
  const dbCollections = await dbo.collections()
  const collectionsName = dbCollections.map(collection => collection.s.name)
  const dropCollections = collectionsName.map(collection =>
    dbo.collection(collection).drop()
  )
  await Promise.all(dropCollections)
}

function getSeedInventories () {
  return [
    {
      inventoryId: 'INVENTORY_001',
      productId: 'PRODUCT_001',
      quantity: 10
    },
    {
      inventoryId: 'INVENTORY_002',
      productId: 'PRODUCT_002',
      quantity: 15
    }
  ]
}

async function seedDatabase (db) {
  const dbo = db.db('distributed-messaging')
  const collections = ['inventories', 'orders']
  const createCollections = collections.map(async collection =>
    dbo.createCollection(collection)
  )
  await Promise.all(createCollections)
  await dbo.collection('inventories').insertMany(getSeedInventories())
}

module.exports = {
  dropCollections,
  seedDatabase
}
