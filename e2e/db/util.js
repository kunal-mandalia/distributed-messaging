async function dropCollections (db) {
  const dbo = db.db('distributed-messaging')
  const dbCollections = await dbo.collections()
  const collectionsName = dbCollections.map(collection => collection.s.name)
  const dropCollections = collectionsName.map(collection =>
    dbo.collection(collection).drop()
  )
  return Promise.all(dropCollections)
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
  collections.forEach(async collection => {
    await dbo.createCollection(collection)
  })
  await dbo.collection('inventories').insertMany(getSeedInventories())
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
