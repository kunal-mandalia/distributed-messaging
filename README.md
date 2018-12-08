# distributed-messaging
Using messages between microservices to achieve an available, partition tolerant, eventually consistent system 

## Overview

This app consists of a set of microservices representing an eCommerce app. How the services are able to communicate with each other is the focus of this project. E.g. when an Order is placed, Accont and Delivery services must be notified. In the case of either subscriber service experiencing a network partition and subsequently recovering from the partition the event it subscribes to should be processed.

## Design Decisions

Command Query Response Segregation (CQRS) to handle mutations by way of async Commands, queries will read from the microservice persistence layer in the usual way.

Domain Driven Design (DDD) to identify aggregate roots among domain objects so that Commands may be constructed around their bounded context.

### Flow of Control

#### Queries

* User requests data and send a RESTful request over http to API Gateway service
* API Gateway service requests a resource from a microservice over http
* API Gateway service returns a JSON payload

#### Commands

* User requests a state change by sending a RESTful request over http to API Gateway service
* API Gateway service requests a mutation on a Domain Service (microservice) over http
* Domain Service queues a Command and returns a status OK
* API Gateway service returns with a status OK
* (optional: the clientside may update its state optimistically)
* Command is consumed from Broker by the listening Domain Service
  * On failure the consumer will retry consuming the command after a delay
  * On success the state relating to the aggregate is updated and an Event representing this state change is published
    * Subscribers e.g. the Inventory Domain Service may react to the Event by updating stock and publishing an associated Event 

### Messaging

Kafka Broker
Kafka Producer
Kafka Consumer

Topics:
- Order
- Order
- Inventory

Flow:

AggregateId should be CustomerId?

- Customer completes order (ORDER_CONFIRMATION_SUCCESS): success
    - Payment takes payment (PAYMENT_PROCESSED_SUCCESS): success
        - Inventory updates stock (INVENTORY_UPDATED_SUCCESS): success
        - Delivery schedules a drop (DELIVERY_SCHEDULED_SUCCESS): success

- Customer completes order (ORDER_CONFIRMATION_ERROR): error

- Customer completes order (ORDER_PLACED_SUCCESS): success
    - Payment takes payment (PAYMENT_PROCESSED_ERROR): error
        - Order rollback (ORDER_PLACED_ROLLBACK)

- Customer completes order: ORDER_CONFIRMATION_SUCCESS
    - Payment takes payment: PAYMENT_CHARGE_SUCCESS
        - Inventory updates stock: INVENTORY_UPDATE_SUCCESS
        - Delivery schedules a drop: DELIVERY_SCHEDULED_ERROR
            - Inventory update rollback: INVENTORY_UPDATE_ROLLBACK
            - Payment charge rollback: PAYMENT_CHARGE_ROLLBACK
            - Order confirmation rollback: ORDER_CONFIRMATION_ROLLBACK


Processing messages in the right order:
- AggregateId = CustomerId ensures that within each topic, messages are in order
    

-------
TOPIC
-------

        -------
        CONSUMER
        -------

        -------
        CONSUMER
        -------

