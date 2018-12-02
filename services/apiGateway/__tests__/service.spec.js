const path = require('path')
const axios = require('axios')
const compose = require('docker-compose')

const service = require('../service')

const SERVICE_ADDRESS = 'http://localhost:8080'
const MAX_TIMEOUT = 30000
const DOCKER_COMPOSE_DIR = path.join(__dirname, '../')

async function delay(ms = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

beforeAll(async () => {
  const response = await compose.upAll({ cwd: DOCKER_COMPOSE_DIR, log: true })
  await delay(5000)
}, MAX_TIMEOUT)

beforeEach(async () => {
  await service.start()
})

afterEach(async () => {
  await service.close()
})

afterAll(async () => {
  const response = await compose.down({ cwd: DOCKER_COMPOSE_DIR, log: true })
}, MAX_TIMEOUT)

describe('API Gateway Service', () => {
  describe('health checks', () => {
    it('should pass health check with app running ok', async () => {
      // arrange
      // act
      const response = await axios(`${SERVICE_ADDRESS}/health`)
  
      // assert
      expect(response.data).toMatchObject({
        app: 'API Gateway',
        status: 'UP'
      })
    })

    it('shoult fail health check when app is offline', async () => {
      // arrange
      // act
      await service.close()

      // assert
      await expect(axios(`${SERVICE_ADDRESS}/health`)).rejects
    })
  })

  describe('integration with order service', () => {
    it('should not return an order if it does not exist', async () => {
      // arrange
      // act
      const response = await axios(`${SERVICE_ADDRESS}/order/ORDER-123`)

      // assert
      expect(response.status).toEqual(204)
    })
  })
})
