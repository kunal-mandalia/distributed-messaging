function encodeMessage ({
  id,
  aggregateId,
  resource,
  operation,
  type,
  payload
}) {
  const message = {
    id,
    aggregateId,
    resource,
    operation,
    type,
    payload
  }
  const kafkaMessage = Buffer.from(JSON.stringify(message))
  return kafkaMessage
}

function decodeMessage (encodedMessage) {
  const decodedMessage = JSON.parse(encodedMessage.value.toString())
  return decodedMessage
}

module.exports = {
  encodeMessage,
  decodeMessage
}
