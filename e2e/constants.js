const ONE_MINUTE = 1000 * 60

module.exports = {
  TEST_TIMEOUT: ONE_MINUTE,
  SERVICES: {
    INVENTORY: {
      DOCKER_CONTAINER: 'distributedmessaging_inventory_1'
    },
    ORDER: {
      DOCKER_CONTAINER: 'distributedmessaging_order_1'
    }
  }
}
