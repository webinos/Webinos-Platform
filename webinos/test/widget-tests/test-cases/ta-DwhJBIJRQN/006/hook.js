var id 	    = "bb";
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

function prefEquals(name, value, readonly)
{
    try
    {
        if (!widget) return;
        if (!widget.preferences) return;

        if (!widget.preferences[name])
        {
            fail("Test "+id+" failed because preference "+name+" does not exist");
            return;
        }
        if (widget.preferences[name] !== value)
        {
            fail("Test "+id+" failed because preference "+name+" does not equal "+value);
            return;
        }
        if (readonly !== null)
        {
            try
            {
                widget.preferences[name] = "random-value"
                if (readonly === true)
                {
                    fail("Test "+id+" failed because preference "+name+" is not readonly");
                    return;
                }
            }
            catch (e)
            {
                if(e.code === DOMException.NO_MODIFICATION_ALLOWED_ERR)
                {
                    if (readonly === false)
                    {
                        fail("Test "+id+" failed because preference "+name+" is readonly");
                        return;
                    }
                }
            }
        }

        pass("Test "+id+" passed");

    } catch (e) {
        fail("Test "+id+" failed because "+e.message);
    }
}

oldPass = pass;
pass = function()
{
    pass = oldPass;
    prefEquals("A", "b", false);
}
prefEquals("a", "a", false);
