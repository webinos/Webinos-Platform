var id 	    = "b7";
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

function multiEquals(props, values)
{
    try
    {
        if (window.widget)
        {
			for(var i in props){ 
				if (window.widget[props[i]] !== values[i]){
            		fail("Test "+id+" failed because property "+props[i]+" was not equal to "+values[i]);
					return;
				}
			}
			var msg = "Test "+id+" passed because properties "+props.join(", ")+" were equal to "+values.join(", ")
			pass(msg);
			return;		
        }
    } catch (e) {
        fail("Test "+id+" failed because "+e.message);
    }
}

multiEquals(["author",  "authorHref", "authorEmail"], ["PASS", "PASS:", "PASS"]);