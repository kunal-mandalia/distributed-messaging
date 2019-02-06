const RESOURCE_MAP = {
  ORDER: 'ORDER',
  INVENTORY: 'INVENTORY'
}

const OPERATION_MAP = {
  CREATE: 'CREATE',
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED'
}

const MESSAGE_TYPE_MAP = {
  COMMAND: 'COMMAND',
  QUERY: 'QUERY',
  EVENT: 'EVENT'
}

const TOPIC_MAP = {
  ORDER: 'ORDER',
  INVENTORY: 'INVENTORY'
}

const CONSUMER_GROUP_MAP = {
  ORDER: 'order-service-consumer',
  INVENTORY: 'inventory-service-consumer',
  NOTIFICATION: 'notification-service-consumer'
}

module.exports = {
  RESOURCE_MAP,
  OPERATION_MAP,
  MESSAGE_TYPE_MAP,
  TOPIC_MAP,
  CONSUMER_GROUP_MAP
}
