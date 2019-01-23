# Listen to yourself
1. API Gateway Service produces a message to define a state change requested by user "ORDER_RECEIVED"
2. Order Service will consume "ORDER_RECEIVED" message and update db and commit message
    1. If update to db fails, Order service will retry consuming message upon restart
    2. If update to db succeeds but the message is not committed then the message will be consumed again until it is committed. Therefore idempontency must be built in; either into the message payload (e.g. the message shows the absolute or final state of an entity as opposed to a relative change)

3. Inventory Service consumes "ORDER_RECEIVED", produces message "INVENTORY_UPDATED" then commit consumed message
    1. (similar to 2.1)
    2. (similar to 2.2)

4. Inventory Service consumes "INVENTORY_UPDATED" message and updates stock in db and commits message
    1. (similar to 2.1)
    2. (similar to 2.2)
    3. If the update is not valid e.g. not enough stock, a message will be produced "INVENTORY_OUT_OF_STOCK"
        1. (similar to 2.1)
        2. (similar to 2.1)

5. Order Service will consume "INVENTORY_OUT_OF_STOCK" and produce an "ORDER_FAILED" message
    1. (similar to 2.1)
    2. (similar to 2.2)

6. Order Service consumes "ORDER_FAILED" and updates db and commits message
    1. (similar to 2.1)
    2. (similar to 2.2)

The happy path:
ORDER_RECEIVED -> INVENTORY_UPDATED -> ORDER_FULFILLED

The failure path:
ORDER_RECEIVED -> INVENTORY_UPDATED -> ORDER_FULFILLED
ORDER_RECEIVED -> INVENTORY_UPDATE_FAILED -> ORDER_FAILED

Message aggregateId:

Order: orderId
Inventory: inventoryId

Topics / aggregateIds

