var id 	    = "dq";
// Replace with reporting mechanism
function hook(id, result, message){};

if (document.title === "PASS") hook(id, "pass");
else if (document.title === "FAIL") hook(id, "fail", "Test "+id+" failed");
