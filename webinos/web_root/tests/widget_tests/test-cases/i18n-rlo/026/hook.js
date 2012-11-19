var id 	    = "i18nrlo26";
var reason  = document.getElementById("reason");
var body    = document.body;
var verdict = document.getElementById("verdict");

function hook(id, result, message){};

function pass(message)
{
    hook(id, "pass", reason);
    document.title = "PASS";
    body.style.background = "green";
    verdict.innerHTML = "PASS";
    reason.innerHTML = message;
}

function fail(message)
{
    hook(id, "fail", reason);
    document.title = "FAIL";
    body.style.background = "red";
    verdict.innerHTML = "FAIL";
    reason.innerHTML = message;
}

function evalEquals(prop, value, comparison)
{
	if(window.widget){
		comparison = comparison || "equal";
		var particle = (comparison === "equal") ? " to " : " than ";
		try
		{
			if ((comparison === "equal" && eval(prop) === value) ||
				(comparison === "greater" && eval(prop) > value) ||
				(comparison === "less" && eval(prop) < value)
			)
			{
				var msg = "Test "+id+" passed because property "+prop+" was "+comparison+particle+value
				pass(msg);
				return;
			}
			fail("Test "+id+" failed because property "+prop+" was not "+comparison+particle+value);
		} catch (e) {
			fail("Test "+id+" failed because "+e.message);
		}
	}
}

evalEquals("document.title", "PASS", "equal");
