#! /bin/bash

# This test file is designed to be run by Travis CI or by someone with a 
# fresh install of webinos and all the dependencies.

# We're going to complete all tests and then succeed or fail at the end.
# Here's the accumulator variable
test_failed=false

# First, lets test starting the PZP
node webinos_pzp.js --test
if [ $? -ne 0 ]; then
  echo "Failed to start the PZP"
  test_failed=true;
fi

# Next, lets test starting the PZH
mv ./webinos_config.json ./webinos_config_orig.json
cp ./tools/travis/travis_webinos_config.json ./webinos_config.json
node webinos_pzh.js --test
if [ $? -ne 0 ]; then
  echo "Failed to start the PZH"
  test_failed=true;
fi

#Now we run some tests.

# Policy manager
cd ./webinos/core/manager/policy_manager/test/jasmine/
jasmine-node .
if [ $? -ne 0 ]; then
  echo "Failed to start the PZP"
  test_failed=true;
fi

if $test_failed ; then
  echo 'At least one test step failed, exiting with an error'
  exit 999
fi

exit 0
