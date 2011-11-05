#!/bin/bash

NAME=$1
P=./log/${NAME}

for i in ${P}/access.log*.gz ;
do
  target=`basename ${i} .gz`
  echo "zcat ${i} | nendo ./ap2json.nnd > ${P}/${target}.json"
  time zcat ${i} | nendo ./ap2json.nnd > ${P}/${target}.json
done
