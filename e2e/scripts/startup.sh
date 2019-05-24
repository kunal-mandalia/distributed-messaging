#!/bin/bash

delay=1
maxAttempts=900

# (serviceName, host, port)
wait_until_online() {
    echo Waiting for $1
    for i in `seq 1 $maxAttempts`;
    do
        nc -z $2 $3 && echo $1 is online && return
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


echo Started waiting for all services

if [ "$1" = "CI" ]
then
  wait_until_online kafka kafka 29092
  wait_until_online mongo mongo 27017
  
  wait_for_service apiGateway api-gateway 8090
  wait_for_service inventory inventory 8091
  wait_for_service order order 8092
  wait_for_service notification notification 8093
  
elif [ "$1" = "local" ]
then
  wait_until_online kafka 0.0.0.0 9092
  wait_until_online mongo 0.0.0.0 27017
  
  wait_for_service apiGateway 0.0.0.0 8900
  wait_for_service inventory 0.0.0.0 8901
  wait_for_service order 0.0.0.0 8902
  wait_for_service notification 0.0.0.0 8903
  
else
  echo Provide environment argument: "CI" or "local"
  exit 1
fi

echo Services are up and running!