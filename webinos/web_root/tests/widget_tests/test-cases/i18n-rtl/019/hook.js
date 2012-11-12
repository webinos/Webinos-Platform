var id      = "i18nrtl19";
var reason  = document.getElementById("reason");
var body    = document.body;
var verdict = document.getElementById("verdict");

function pass(message)
{
    document.title = "PASS";
    body.style.background = "green";
    verdict.innerHTML = "PASS";
    reason.innerHTML = message;
}

function fail(message)
{
    document.title = "FAIL";
    body.style.background = "red";
    verdict.innerHTML = "FAIL";
    reason.innerHTML = message;
}

function propEquals(prop, value)
{
    try{
        if(window.widget){
            if(window.widget[prop] === value){
                pass("Test " + id + " passed because property \"" + prop + "\" was equal to \"" + value + "\".");
                return;
            }
            fail("Test " + id + " failed because property \"" + prop + "\" was not equal to \"" + value + "\". The property \"" + prop + "\" returned \"" + window.widget[prop] + "\".");
        }
    } catch (e) {
        fail("Test " + id + " failed because " + e.message);
    }
}

propEquals("name", "\u202b<-- \u202a< PAS\u202cSED\u202c");
