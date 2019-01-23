const { encodeMessage, decodeMessage } = require('../../shared/kafka/message')
const { RESOURCE_MAP, OPERATION_MAP, MESSAGE_TYPE_MAP } = require('../../shared/constants')

const { ORDER } = RESOURCE_MAP
const { CREATE, CREATED } = OPERATION_MAP
const { COMMAND, EVENT } = MESSAGE_TYPE_MAP

const consumersDefinition = [
  {
    consumerGroupId: 'order-service-consumer',
    topicNames: ['order'],
    handler: producer => consumer => async message => {
      console.log('order-service-consumer received message')
      console.log(message)
      console.log(message.value.toString())

      const { aggregateId, resource, operation, type, payload } = decodeMessage(message)

      if (resource !== ORDER) {
        console.log(`ignoring messaging ${aggregateId}`)
        return
      }

      if (operation === CREATE && type === COMMAND) {

          // update db idempotently
          
          // produce kafka message
          const eventMessage = encodeMessage({
            aggregateId,
            resource: ORDER,
            operation: CREATED,
            type: EVENT,
            payload
          })
          producer.produce('order', -1, eventMessage, aggregateId)
          
          // ack message
          await consumer.commitMessage(message)
        }

        console.log(`unhandled message:
          ${aggregateId}
          ${resource}
          ${operation}
          ${type}
          ${JSON.stringify(payload, null, 4)}
        `)
    }
  }
]

module.exports = consumersDefinition
