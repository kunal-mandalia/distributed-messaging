const axios = require('axios')
const { connect } = require('./db/db')
const { dropCollections, seedDatabase, delay } = require('./db/util')
const endpoints = require('./endpoints')

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
  describe(`api-gateway service`, () => {
    it(`should be healthy`, async () => {
      // arrange
      // act
      const response = await axios.get(
        `${endpoints.apiGateway}/health`,
        {
          headers: { 'content-type': 'application/json' }
        }
      )

      // assert
      expect(response.data).toEqual({ 'app': 'API Gateway', 'status': 'UP' })
    })
  })
})
