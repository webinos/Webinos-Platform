/*
NOTE: THIS TEST ONLY WORKS WITH WAC RUNTIMES. 
*/

window.onload = function WACtest() {
    if (window.deviceapis) {

        var feature_name    = "feature:a9bb79c1";
        var param_name      = "test";
        var param_values    = ["pass1","pass2"];
        var features_found  = [false,false];
        var title           = document.title;
        var body            = document.body;
        var verdict         = document.getElementById("verdict");
        var reason          = document.getElementById("reason");

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
                    if(params.length!=1){
                        fail("Feature \"" + feature_name + "\" has " + params.length + " params. Should have 1");
                        return;
                    } else {
                        var param=params[0];
                        if(param.name === param_name){
                            if(param.value === param_values[0]){
                                if(features_found[0] === true){
                                    fail("Found two features \"" + feature_name + "\" with the same param value: \"" + param.value + "\".");
                                    return;
                                }
                                features_found[0]=true;
                            } else if(param.value === param_values[1]){
                                if(features_found[1] === true){
                                    fail("Found two features \"" + feature_name + "\" with the same param value: \"" + param.value + "\".");
                                    return;
                                }
                                features_found[1]=true;
                            } else {
                                fail("Found feature \"" + feature_name + "\" with param with wrong value: \"" + param.value + "\".");
                                return;
                            }
                        } else {
                            fail("Found feature \"" + feature_name + "\" with a wrong param name: \"" + param.name + "\".");
                            return;
                        }
                    }
                }
            }
            var f=0;
            for(var i=0;i<2;i++){
                if(features_found[i] === true) f++;
            }
            if(f == 2){
                pass("Found two features named \"" + feature_name + "\". Both had correct sets of params.");
            } else if(f == 1){
                fail("Found just one feature named \"" + feature_name + "\".");
            } else {
                fail("Didn't find any feature named \"" + feature_name + "\".");
            }
        } catch (e) {
            fail(e);
        }
    }
}
