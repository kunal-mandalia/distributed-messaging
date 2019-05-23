module.exports = {
  TEST_TIMEOUT: 5000,
  SERVICES: {
    INVENTORY: {
      DOCKER_CONTAINER: 'distributedmessaging_inventory_1'
    },
    ORDER: {
      DOCKER_CONTAINER: 'distributedmessaging_order_1'
    }
  }
}
