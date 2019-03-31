module.exports = {
  TEST_TIMEOUT: 60000,
  SERVICES: {
    INVENTORY: {
      DOCKER_CONTAINER: 'docker-composition_inventory_1'
    },
    ORDER: {
      DOCKER_CONTAINER: 'docker-composition_order_1'
    }
  }
}
