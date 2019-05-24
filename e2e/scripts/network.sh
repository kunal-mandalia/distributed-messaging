#!/bin/bash

maxAttempts=250
delay=5

wait_for_network() {
  echo Waiting network $1...
  for i in `seq 1 $maxAttempts`;
  do
    echo "Getting network..."
    network="$(docker network ls|grep $1)"
    echo ${network}
    if [[ ${network} == *"$1"* ]]
      then
        echo "Network available"
        return
      else
        sleep ${delay}
    fi
  done
  echo Failed waiting for network $1 && exit 1
}
