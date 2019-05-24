#!/bin/bash

maxAttempts=100
delay=2

wait_for_network() {
  echo Waiting network $1...
  for i in `seq 1 $maxAttempts`;
  do
    network="$(docker network ls|grep $1)"
    if [[ ${network} == *"$1"* ]]
      then
        echo "Network available"
        return
      else
        sleep ${delay}
    fi
  done
  echo Failed waiting for network $1
}
