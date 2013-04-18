#!/bin/bash

# This script will iterate through the webinos platform and run all unit tests
# If an argument is specified, then only whitelisted tests will be executed,
# otherwise, all tests will be executed

# Assumptions:
# 1. jasmine is being used for the tests
# 2. all the specs are found in tests/jasmine
# 3. jasmine-node is installed
# Let's begin by defining some variables and utility functions

webinos_dir=$PWD
test_failed=false

# function to run jasmine test on specific component passed in as first argument
run_unit_test(){
        if [ $1 ]; then
		relative_path=$1
		#this can be improved if the argument passed is an absolute path
		#alternatively, we could CD into webinos_dir, follows by CD to relative_path
                component_absolute_path=$webinos_dir${relative_path#"."}
                #make sure the directory exists
                if [ -d "$component_absolute_path" ]
                then
                        cd "$component_absolute_path"
                        jasmine-node .
                        if [ $? -ne 0 ]; then
                          echo "Unit test failed on $component_absolute_path"
                          test_failed=true;
                        fi
                else
                        echo "Sorry, $component_absolute_path does not exist"
                fi
        fi
}

#TODO: add the components that need to be part of the whitelist here..
#'./webinos/core/xmpp-pzp/test/jasmine',
#'./webinos/core/manager/certificate_manager/test/jasmine',
#'./webinos/core/manager/keystore/test/jasmine',
#'./webinos/core/manager/context_manager/test/jasmine',
#'./webinos/core/manager/messaging/test/jasmine',
#'./webinos/core/api/events/test/jasmine',
#'./webinos/core/api/context/test/jasmine',
#'./webinos/core/api/deviceorientation/test/jasmine',
#'./webinos/core/api/applauncher/test/jasmine',
#'./webinos/core/api/contacts/test/jasmine',
#'./webinos/core/api/vehicle/test/jasmine',
#'./webinos/core/api/mediacontent/test/jasmine',
#'./webinos/web_root/tests/test_frameworks/jasmine-1.2.0'

#whitelist=('./webinos/core/manager/policy_manager/test/jasmine')
whitelist=( "./webinos/core/manager/policy_manager/test/jasmine"
	"./webinos/core/manager/widget_manager/test/jasmine"
	"./webinos/core/util/test/jasmine"
	"./webinos/core/manager/policy_manager/test/jasmine.policy.tests.working" )
#function to determine whether tests will be run on the given component
#currently, all tests under included in the whitelist will not be filtered
filter(){
	if contains "$1" "${whitelist[@]}"
	then
		return 0
	else
		return 1
	fi
}
contains () {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

# let's get all the components that have jasmine tests
#currently, these are identified as existing in a directory "test/jasmine"
# POSSIBILITY: Change the logic of identifying which components to run tests on
# components = list of directories with  -name "*jasmine*"

run_all_tests(){
	apply_filter=$1
	find . -type d -name '*jasmine*' | while read -r component ; do
        	#make sure the directory exists    
		if [ $apply_filter ]
		then 
			#Apply the filter
			if filter "$component"
        		then
        			printf 'Running unit test on component : '"'%s'"'\n' "$component"
				run_unit_test $component
			else
				echo "$component has been filtered, so no tests will be run on it"
			 fi
		else
			echo 'Filter has not been applied, proceeding with test run..'
        		printf 'Running unit test on component : '"'%s'"'\n' "$component"
			run_unit_test $component
		fi
	done	
}

#This function passes an argument to run_all_tests to enable filtering
# based on the entries in the whitelist
run_whitelisted_tests(){
	echo 'whitelisted tests called'
        run_all_tests 0
	#for component in $whitelist
        #do
         #       printf 'Running unit test on component : '"'%s'"'\n' "$component"
           #     run_unit_test $component
        #done
}

#Check if an argument has been passed to the script
# Is so, then call whitelisted tests
if [ $1 ] 
then
	run_whitelisted_tests
else
	run_all_tests
fi

if $test_failed ; then
  echo 'One or more unit tests failed, exiting with an error'
  exit 999
fi

exit 0
