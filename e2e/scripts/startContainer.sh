#!/bin/bash

delay=1
maxAttempts=900

start_container() {
  echo Starting container "$1" ...
  docker start "$1"
  echo Started container "$1"
  wait_for_service "$1" "$2"
}

wait_for_service() {
  echo Waiting for $1 $2 ...
  for i in `seq 1 $maxAttempts`;
  do
    RESPONSE=$(curl -H "Content-Type:application/json" -H "Accept:application/json" --silent $2/readiness)
    if [ "$?" == "0" ]; then 
    echo $1 health: $RESPONSE
      if [[ $RESPONSE == *"\"ready\":true"* ]]
      then
        printf $1 is ready
        return
      else
        printf "."
        sleep $delay
      fi
    else
      printf "."
      sleep $delay
    fi
  done
  echo Failed waiting for $1 && exit 1
}

if [[ (-z "$1") || (-z "$2") ]]
  then
    echo "Invalid args. Expected dockercontainer, address"
  else
    start_container "$1" "$2"
fi
