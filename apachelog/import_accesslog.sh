#!/bin/bash

NAME=$1
P=./log/${NAME}

for i in ${P}/access.log*.json ;
do
  echo "mongoimport  --host black -d sumibi -c ${NAME} ${i}"
  time mongoimport  --host black -d sumibi -c ${NAME} ${i}
done
