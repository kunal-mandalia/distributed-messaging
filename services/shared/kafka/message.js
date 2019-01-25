function encodeMessage({
  aggregateId,
  resource,
  operation,
  type,
  payload
}) {
  const message = {
    aggregateId,
    resource,
    operation,
    type,
    payload
  }
  const kafkaMessage = Buffer.from(JSON.stringify(message))
  return kafkaMessage
}

function decodeMessage(encodedMessage) {
  const decodedMessage = JSON.parse(encodedMessage.value.toString())
  return decodedMessage
}

function getDecodedMessageId(decodedMessage) {
  const { resource, type, operation, aggregateId } = decodedMessage
  const id = `${type}:${resource}:${operation}:${aggregateId}`
  return id
}

module.exports = {
  encodeMessage,
  decodeMessage,
  getDecodedMessageId
}