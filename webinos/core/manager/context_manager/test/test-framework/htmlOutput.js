/*
	Basic output of test results to HTML.
	Receives the result of running the named test.
	Requires a container named 'testResults' to be present in the DOM.
*/
function logTestResultToHTML(testName, passed, description) {

	// Create element to display test result
	var el = document.createElement('div');

	// Format depending on pass/fail
	if (passed) {
		el.className = "testResult passed";
		el.innerHTML = testName + " PASSED with '" + description + "'";
	} else {
		el.className = "testResult failed";
		el.innerHTML = testName + " FAILED with '" + description + "'";
	}

	// Append to results list
	document.getElementById('testResults').appendChild(el);
}
