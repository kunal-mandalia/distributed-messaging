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
  console.log('encodeMessage', JSON.stringify(message, null, 4))
  return kafkaMessage
}

function decodeMessage (encodedMessage) {
  const decodedMessage = JSON.parse(encodedMessage.value.toString())
  console.log('decodedMessage', JSON.stringify(decodedMessage, null, 4))
  return decodedMessage
}

module.exports = {
  encodeMessage,
  decodeMessage
}
