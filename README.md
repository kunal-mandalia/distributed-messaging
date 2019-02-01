# distributed-messaging
Using messages to communicate between microservices to achieve an available, partition tolerant, eventually consistent system 

## Overview

This app models the canonical online store. It starts small with two domain services; the Order service, and the Inventory service. Each service reacts to events e.g. when an Order is created an order created event is produced, the Inventory service consumes this event and updates the stock as per the order.

What happens if the Inventory service is offline? Or if there isn't enough stock? Designing a system which can tolerate this and eventually recover to handle the flow of the Order is the focus of this project.

There's an emphasis placed on ensuring messages are processed in an idempotent way since we won't guarantee exactly once delivery of messages.

## Design Decisions

Martin Fowler categorises the [many meanings of "event-driven" architecture](https://www.youtube.com/watch?v=STKCRSUsyP0). The architecture in this app aligns closely with what he calls "Event Notification".

While the "Event Notification" pattern shows how services will communicate with each other, what they communicate i.e. the event message payload will be guided by Domain Driven Design (DDD). This means exposing a common set of high level message attributes which allow services to react to Events but not enough for data to bleed across bounded contexts.

Finally a couple of terms from CQRS will be used to help identify the different intent of messages; Commands for when the user makes a state changing request e.g. placing an order, and Events for emitting a notification following a change to a service e.g. inventory updated.

Kafka is at the heart of the system so concepts like topics, partitions,offset, etc. play a key role.

### Development

Run the infrastructure:

* Kafka Broker: `yarn start-kafka-broker`
* Persistence: `yarn start-persistence`

Run individual services:

* API gateway: `yarn start-service-api-gateway`
* Order domain service: `yarn start-service-order`
* Inventory domain service: `yarn start-service-inventory`


Seed data:

* Inventory: `curl -XPOST http://localhost:8901/automation-testing/seed`

Create an order:

* ORDER_001: `yarn post-order-1`
* ORDER_002: `yarn post-order-2`

Creating an order is idempotent; it'll only be processed once. Therefore ORDER_001 may be placed many times but stock will only adjust the first time.

### Test

The app consists of a set of services each with their own set of tests. Run `yarn test` in the context of a service to run tests.