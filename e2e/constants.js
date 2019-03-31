module.exports = {
  TEST_TIMEOUT: 60000,
  HOSTNAME: 'localhost',
  SERVICES: {
    INVENTORY: {
      DOCKER_CONTAINER: 'docker-composition_inventory_1',
      PORT: 8901
    },
    ORDER: {
      DOCKER_CONTAINER: 'docker-composition_order_1',
      PORT: 8902
    }
  }
}
