/*
NOTE: THIS TEST ONLY WORKS WITH WAC RUNTIMES. 
*/
window.onload = function WACtest() {
    if (window.deviceapis) {

        var feature_name = "feature:a9bb79c1";
        var param_name   = "";
        var param_value  = "";
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
                    pass("Feature \"" + feature_name + "\" was found.");
                    return;
                }
            }
            fail("Feature \"" + feature_name + "\" was not found.");
        } catch (e) {
            fail(e);
        }
    }
}
