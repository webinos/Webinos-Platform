/*
NOTE: THIS TEST ONLY WORKS WITH WAC RUNTIMES. 
*/
window.onload = function WACtest() {
    if (window.deviceapis) {

        var feature_name = "feature:a9bb79c1";
        var param_name   = "PASS";
        var param_values  = ["value1","value2"];
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
                    if(params.length!=2){
                        fail("Feature \"" + feature_name + "\" has " + params.length + " params. Should have 2");
                        return;
                    } else {
                        if(params[0].name != param_name || params[1].name != param_name){
                            fail("Feature \"" + feature_name + "\" params have wrong names: \"" + params[0].name + "\" and \"" + params[1].name + "\". Both should be \"" + param_name + "\".");
                            return;
                        }
                        if( (params[0].value == param_values[0] && params[1].value == param_values[1]) ||
                            (params[0].value == param_values[1] && params[1].value == param_values[0]) )
                        {
                            pass("Feature \"" + feature_name + "\" has correct set of params.");
                            return;
                        }
                        fail("Feature \"" + feature_name + "\" params have wrong values: \"" + params[0].value + "\" and \"" + params[1].value + "\". Values should be: \"" + param_values[0] + "\" and \"" + param_values[1] + "\".");
                        return;
                    }
                }
            }
            fail("Feature \"" + feature_name + "\" was not found.");
        } catch (e) {
            fail(e);
        }
    }
}
