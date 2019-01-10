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
  const decodedMessage = JSON.parse(encodedMessage)
  return decodedMessage
}

module.exports = {
  encodeMessage,
  decodeMessage
}