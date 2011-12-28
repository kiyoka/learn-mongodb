
all:
	echo nothing to do.

# sumibiorg
convert1:
	nendo gen_json_makefile.nnd ./log/sumibiorg/access.log*.gz > Makefile.1.tmp
	make -f Makefile.1.tmp

clean1:
	/bin/rm -f ./log/sumibiorg/access.log*.json

import1:
	bash import_accesslog.sh  sumibiorg


# oldtype
convert2:
	bash convert_accesslog.sh oldtype

import2:
	bash import_accesslog.sh oldtype




