var id 	    = "a7";
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
        if (!widget) throw "Widget object not supported.";
        if (!widget.preferences) throw "widget preferences not implemented.";

        if (!widget.preferences[name])
        {
            fail("Test "+id+" failed because preference "+name+" does not exist");
            return;
        }
        if (widget.preferences[name] !== value)
        {
            fail("Test "+id+" failed because property "+prop+" was not equal to "+value + ". The property '" + prop + "' returned '" + window.widget[prop] + "'");
            return;
        }
   	
        try
        {
            //if the preference is read-only, this will throw a NO_MODIFICATION_ALLOWED_ERR
            widget.preferences[name] = "random-value"; 
                
            //it didn't throw, so check if it was read only
            if (readonly === "true")
            {
                fail("Test "+id+" failed because preference "+name+" is writable. It should be readonly.");
                return;
            }
        }
        catch (e)
        {
            if(e.code === DOMException.NO_MODIFICATION_ALLOWED_ERR)
            {
            	if (readonly === "false")
                {
                	fail("Test "+id+" failed because preference "+name+" is readonly. It should be writable.");
                    return;
                }
        	 }
        }
        pass("Test "+id+" passed");
    } 
    catch (e) //catch all errors 
    {
        fail("Test "+id+" failed because "+e.message);
    }
}

prefEquals("PASS", "PASS", "false");
