const { connect } = require('./db/db')
const { dropDatabase } = require('./db/util')

let db

beforeAll(async () => {
  db = await connect()
})

beforeEach(async () => {
  await dropDatabase(db)
})

afterEach(async () => {
  // await seedDatabase()
})

afterAll(async () => {
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
