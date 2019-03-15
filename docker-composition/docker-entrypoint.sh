#!/bin/bash

delay=1
maxAttempts=150

# (serviceName, host, port)
wait_until_online() {
    echo Waiting for $1
    for i in `seq 1 $maxAttempts`;
    do
        nc -z $2 $3 && echo $1 is online && return
        echo -ne "."
        sleep $delay
    done
    echo Failed waiting for $1 && exit 1
}

# (serviceName, domain, port)
wait_for_service() {
  echo Waiting for $1 $2:$3
  for i in `seq 1 $maxAttempts`;
  do
    RESPONSE=$(curl -H "Content-Type:application/json" -H "Accept:application/json" --silent http://$2:$3/readiness)
    if [ "$?" == "0" ]; then 
    echo $1 health: $RESPONSE
      if [[ $RESPONSE == *"\"ready\":true"* ]]
      then
        echo $1 is ready
        return
      else
        echo -ne "."
        sleep $delay
      fi
    else
      echo -ne "."
      sleep $delay
    fi
  done
  echo Failed waiting for $1 && exit 1
}


if [ "$1" = "start" ]
then
  echo Started waiting for all services

  wait_until_online kafka localhost 9092
  wait_until_online mongo localhost 27017
  
  wait_for_service apiGateway localhost 8900
  wait_for_service inventory localhost 8901
  wait_for_service order localhost 8902
  wait_for_service notification localhost 8903
  
  echo Services are up and running!
fi