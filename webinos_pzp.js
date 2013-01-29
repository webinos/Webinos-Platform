#!/usr/bin/env node
/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *******************************************************************************/

var pzp = require ("./webinos/core/pzp/lib/pzp");
__EnablePolicyEditor = false;

var argv = require ('optimist')
    .usage ('Starts webinos PZP \nUsage: $0')
    .options ({
        "pzhHost"         :{
            describe:"set the ip-address of the pzh provider",
            default :"0.0.0.0"
        },
        "pzhName"         :{
            describe:"sets The email id of the pzh you intend to connect",
            default :""
        },
        "friendlyName"    :{
            describe:"sets the name assigned to the PZP such as PC/Mobile/TV",
            default :""
        },
        "forcedDeviceName":{
            describe:"Forced PZP device name that you assign instead of the default PZP name",
            default :""
        },
        "widgetServer"    :{
            describe:"starts widget server",
            default :false
        },
        "policyEditor"    :{
            describe:"starts policy editor server",
            default :false
        },
        "signedWidgetOnly":{
            describe:"only allow signed widgets",
            default :false
        },
        "enforceWidgetCSP":{
            describe:"enforce content security policy on the widgets",
            default :false
        },
        "help"            :{
            describe:"to get this help menu"
        }})
    .argv;

if (argv.help) {
    require ('optimist').showHelp ();
    process.exit ();
}
if (argv.policyEditor) {
    __EnablePolicyEditor = true;
}

require ("fs").readFile (require ("path").join (__dirname, "config-pzp.json"), function (err, data) {
    var config = {};
    if (!err) {
        config = JSON.parse (data);
    }

    // overwrite config file options with cli options
    config = require ('./webinos/core/util/lib/helpers').extend (config, argv);

    if (config.pzhName !== "") {
        config.sessionIdentity = config.pzhHost + '/' + config.pzhName;
    } else {
        config.sessionIdentity = config.pzhHost;
    }
    initializePzp (config);
});

function initializeWidgetServer () {
    // Widget manager server
    var wrt = require ("./webinos/core/manager/widget_manager/lib/ui/widgetServer");
    if (typeof wrt !== "undefined") {
        // Attempt to start the widget server.
        wrt.start (argv.signedWidgetOnly, argv.enforceWidgetCSP, pzp.session.getWebinosPorts ().pzp_webSocket,
            function (msg, wrtPort) {
                if (msg === "startedWRT") {
                    // Write the websocket and widget server ports to file so the renderer can pick them up.
                    var wrtConfig = {};
                    wrtConfig.runtimeWebServerPort = wrtPort;
                    wrtConfig.pzpWebSocketPort = pzp.session.getWebinosPorts ().pzp_webSocket;
                    wrtConfig.pzpPath = pzp.session.getWebinosPath ();
                    require ("fs").writeFile ((require ("path").join (pzp.session.getWebinosPath (), '../wrt/webinos_runtime.json')),
                        JSON.stringify (wrtConfig, null, ' '), function (err) {
                            if (err) {
                                console.log ('error saving runtime configuration file: ' + err);
                            } else {
                                console.log ('saved configuration runtime file');
                            }
                        });
                } else {
                    console.log ('error starting wrt server: ' + msg);
                }
            });
    }
}

function initializePzp (config) {
    pzp.session.initializePzp (config, function (status, result) {
        if (status) {
            if (argv.widgetServer)
                initializeWidgetServer ();
        } else {
            console.log ("unsuccessful in starting PZP" + result);
        }
    });
}

