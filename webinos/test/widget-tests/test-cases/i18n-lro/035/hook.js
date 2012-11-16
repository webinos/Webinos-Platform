var id 	    = "i18nlro35";
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


function prefPropDelete(prop, value)
{
    try
    {
        if (window.widget)
        {
            if (window.widget.preferences[prop] === value)
            {
                try{
                    window.widget.preferences.removeItem(prop);
                    fail("Test "+id+" failed because deleting property "+prop+" from widget.preference did not throw an exception!")
                    return;
                }catch(e){
                   if(e.code === 7){ 
                    var msg = "Test "+id+" passed because property "+prop+" could not be deleted"; 
                    pass(msg);
                 }else{
                    fail("Test "+id+" failed because the following exception was thrown while trying to remove a property from widget.preferences: "  +e);
                 } 
                }
                
                return;
            }
            fail("Test "+id+" failed because property "+prop+" was not equal to "+value + ". The property '" + prop + "' returned '" + window.widget[prop] + "'");
        }
    } catch (e) {
        fail("Test "+id+" failed because "+e.message);
    }
}

prefPropDelete("TEST", "TEST");
