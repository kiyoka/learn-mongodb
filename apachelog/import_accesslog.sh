#!/bin/bash

P=./log/apache2

for i in ${P}/access.log.*.json ;
do
  echo "mongoimport  -d sumibi -c apachelog ${i}"
  time mongoimport  -d sumibi -c apachelog ${i}
done
