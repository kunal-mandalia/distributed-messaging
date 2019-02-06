# notification
Real time user notifications


## Architecture
Kafka Broker -> notification service <-> client (websocket connection)

## Control flow 
Kafka Broker -> notification consumer group (ORDER TOPIC) -> broadcast (user channel)

## Implementation details

- notification service exposes a websocket service
    - allows users to connect and receive messages
