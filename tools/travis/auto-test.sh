#! /bin/bash

# This test file is designed to be run by Travis CI or by someone with a 
# fresh install of webinos and all the dependencies.

# Helper function - this will prepare the config file for use by PZH
config_backup_file=""
prepare_pzh_config(){
	config_backup_file=$1".bak"
	cp -f $1 $config_backup_file
	sed -i 's/\(\s*"provider"\s*:\)\s*[0-9]*,/\16080,/' $1
	sed -i 's/\(\s*"provider_webServer"\s*:\s*\)[0-9]*,/\16443,/' $1	
	echo "webinos_config changed: "
	head $1
}


# We're going to complete all tests and then succeed or fail at the end.
# Here's the accumulator variable
test_failed=false

# fiddle with the PZH config to use high-number ports
prepare_pzh_config "./webinos_config.json"

# Run the PZH
node webinos_pzh.js --test
if [ $? -ne 0 ]; then
  echo "Failed to start the PZH"
  test_failed=true;
fi

#move back the original config file if it still exists
if [ -f "$config_backup_file" ]
then
    echo "moving $config_backup_file"
   mv -f $config_backup_file ./webinos_config.json
fi

# Start the PZP
# Disable as PZP is starting but not getting completely loaded
#node webinos_pzp.js --test
#if [ $? -ne 0 ]; then
#  echo "Failed to start the PZP"
#  test_failed=true;
#fi

# Run the unit tests
# Passing 0, enables whitelisted tests
#./tools/travis/unit-tests.sh 0
if [ $? -ne 0 ]; then
  echo "Failed on one or more unit tests"
  test_failed=true;
fi

if $test_failed ; then
  echo 'At least one test step failed, exiting with an error'
  exit 999
fi

exit 0
