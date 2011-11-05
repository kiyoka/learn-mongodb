#!/bin/bash

NAME=$1
P=./log/${NAME}

for i in ${P}/access.log*.json ;
do
  echo "mongoimport  -d sumibi -c ${NAME} ${i}"
  time mongoimport  -d sumibi -c ${NAME} ${i}
done
