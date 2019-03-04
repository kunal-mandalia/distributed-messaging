#!/bin/sh

set -e

# (serviceName, host, port)
wait_for_service() {
    echo Waiting for $1
    for i in `seq 1 60`;
    do
        nc -z $2 $3 && echo Success && return
        echo -n .
        sleep 1
    done
    echo Failed waiting for $1 && exit 1
}

if [ "$1" = "start" ]
then
  echo initializing
  wait_for_service kafkaZookeeper localhost 2181
  wait_for_service kafkaBroker localhost 9092
  wait_for_service mongodb localhost 27017
  wait_for_service apiGateway localhost 8900
  wait_for_service inventory localhost 8901
  wait_for_service order localhost 8902
  wait_for_service notification localhost 8903
  echo starting
fi

exec "$@"