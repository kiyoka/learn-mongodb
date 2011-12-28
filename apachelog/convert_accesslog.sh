#!/bin/bash

NAME=$1
P=./log/${NAME}

for i in ${P}/access.log*.gz ;
do
  target=`basename ${i} .gz`
  json=${P}/${target}.json
  if [ -f ${json} ] ; then
    echo "Info: already exists ${json}"
  else
    echo "zcat ${i} | nendo ./ap2json.nnd > ${json}"
    time zcat ${i} | nendo ./ap2json.nnd > ${json}
  fi
done
