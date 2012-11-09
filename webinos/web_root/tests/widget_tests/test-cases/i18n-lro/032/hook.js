/*
NOTE: THIS TEST ONLY WORKS WITH WAC RUNTIMES. 
*/
window.onload = function WACtest() {
    if (window.deviceapis) {

        var feature_name = "feature:a9bb79c1";
        var param_name   = "TEST";
        var param_value  = "\u05DD\u05E4\u05DC\u05DC\u05D7\u05E7";
        var title        = document.title;
        var body         = document.body;
        var verdict      = document.getElementById("verdict");
        var reason       = document.getElementById("reason");

        function pass(message) {
            title = "PASS";
            body.style.background = "green";
            verdict.innerHTML = "PASS";
            reason.innerHTML = message;
        }

        function fail(message) {
            title = "FAIL";
            body.style.background = "red";
            verdict.innerHTML = "FAIL";
            reason.innerHTML = message;
        }

        try {
            var features = window.deviceapis.listActivatedFeatures();
            for (var i = 0; i < features.length; i++) {
                if (features[i].uri == feature_name) {
                    var params = features[i].params;
                    for (var j = 0; j < params.length; j++) {
                        if (params[j].name === param_name) {
                            if (params[j].value === param_value){
                                pass("The \"" + param_name + "\" param's value attribute matched \"" + param_value + "\"");
                                return;
                            } else {
                                fail("The \"" + param_name + "\" param's value attribute was \"" + params[j].value + "\". It should be \"" + param_value + "\"");
                                return;
                            }
                        }
                    }
                    fail("The \"" + param_name + "\" param was not found.");
                    return;
                }
            }
            fail("Feature \"" + feature_name + "\" was not found.");
        } catch (e) {
            fail(e);
        }

    }
}
