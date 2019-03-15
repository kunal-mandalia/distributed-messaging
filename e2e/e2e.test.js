const WebSocket = require('ws')
const axios = require('axios')
const { connect } = require('./db/db')
const { dropCollections, seedDatabase } = require('./db/util')
const { notification } = require('./notification')
const endpoints = require('./endpoints')
const { order1 } = require('./fixtures')

let ws
let db
const baseHeaders = { 'content-type': 'application/json' }

beforeAll(async () => {
  ws = new WebSocket('ws://localhost:8904/')
  ws.on('open', () => {})
  ws.on('message', function incoming (data) {
    notification.append(data)
  })
  db = await connect()
  await notification.delay(150)
  await dropCollections(db)
})

beforeEach(async () => {
  await seedDatabase(db)
})

afterEach(async () => {
  await dropCollections(db)
  notification.reset()
})

afterAll(async () => {
  await db.close()
  ws.terminate()
})

describe(`distributed-messaging`, () => {
  describe(`apiGateway service`, () => {
    it(`should be ready`, async () => {
      // arrange
      // act
      const response = await axios.get(
        `${endpoints.apiGateway}/readiness`,
        {
          headers: baseHeaders
        }
      )

      // assert
      expect(response.data).toEqual({ 'app': 'apiGateway', 'ready': true })
    })

    it(`should create an order`, async () => {
      // arrange
      const data = order1

      // act
      const response = await axios.post(
        `${endpoints.apiGateway}/order`,
        {
          data,
          headers: baseHeaders
        }
      )

      // assert
      await notification.waitUntilReceived(4)
      expect(response.status).toEqual(200)
    })
  })
})
