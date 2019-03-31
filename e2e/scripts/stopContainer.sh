#!/bin/bash

stop_container() {
  echo "stopping container" "$1"...
  docker stop "$1"
  echo "stopped container" "$1"
}

if [ -z "$1" ]
  then
    echo "No argument supplied"
  else
    stop_container "$1"
fi
