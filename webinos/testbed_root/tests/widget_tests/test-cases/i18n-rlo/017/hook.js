var id 	    = "i18nrlo17";
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

function propEquals(prop, value)
{
    try
    {
        if (window.widget)
        {
            if (window.widget[prop] === value)
            {
                var msg = "Test "+id+" passed because property "+prop+" was equal to "+value
                pass(msg);
                return;
            }
            fail("Test "+id+" failed because property "+prop+" was not equal to "+value + ". The property '" + prop + "' returned '" + window.widget[prop] + "'");
        }
    } catch (e) {
        fail("Test "+id+" failed because "+e.message);
    }
}

propEquals("author", "\u202EDESSAP\u202C");
