const { connect } = require('./db/db')
const { dropCollections, seedDatabase, delay } = require('./db/util')

let db

beforeAll(async () => {
  db = await connect()
})

beforeEach(async () => {
  await dropCollections(db)
})

afterEach(async () => {
  await seedDatabase(db)
})

afterAll(async () => {
  await delay(100)
  await db.close()
})

describe(`distributed-messaging`, () => {
  describe(`create valid order`, () => {
    it(`should pass`, () => {
      // arrange

      // act

      // assert
      expect(true).toBe(true)
    })
  })
})
