/*

*/

(function (exports) {
	'use strict';
	
	// Unless otherwise specified, test output is sent to the console.
	function log_test_result(testName, passed, description) {
		// Receives the result of running the named test.
		// Display/log results here.
		if (passed) {
			console.log(testName + " PASSED with " + description);
		} else {
			console.log(testName + " FAILED with " + description);
		}
	}
				
	// Move on to the next test.
	function nextTest() {
		testIdx = testIdx + 1;
		if (testIdx < tests.length) {
			runTest();
		}
	}

	// Run the current test.
	function runTest() {
		tests[testIdx].testMethod(function (passed, description) { logOutput(tests[testIdx].testName, passed, description); nextTest(); });
	}

	// Run all the tests in 'testList'. Output will be sent to the (optional) logger.
	function runTests(testList, logger) {
		if (logger) {
			logOutput = logger;
		}
		tests = testList;
		testIdx = 0;
		runTest();
	}

	// Define each test in this array, with a descriptive name followed by the test method itself.
	var tests = [ ];
	var testIdx = 0;
	var logOutput = log_test_result;

	exports.runTests = runTests;
}(window))

