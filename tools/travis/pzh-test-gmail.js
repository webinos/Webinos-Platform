/******************************************************************************
 * 
 * PZH enrolement and inter-zone connection end-to-end test with Gmail
 * accounts. It tests
 *
 *  1. two PZHs enrolling with the same Provider
 *  2. connection of the two PZHs
 *  3. one PZH connecting to the other enrolled with Provider on another host. 
 * 
 *
 * Wei Guo, Samsung R&D Institute UK.
 * 
 ******************************************************************************/

var system = require('system');

if (system.args.length < 8) {
    console.error('Command format doesn\'t match.');
    console.log('Usage: phantomjs --ignore-ssl-errors=yes pzh-test-gmail.js <Gmail account-1> <Gmail account-1 passwd> <Gmail account-1 "firstname surname"> <Gmail account-2> <Gmail account-2 passwd> <Gmail account-2 "firstname surname"> <the other Provider name>');
    console.log('E.g.: phantomjs --ignore-ssl-errors=yes pzh-test-gmail.js webinosa webinostest "A WEBINOS" webinosb webinostest "B WEBINOS" 106.1.10.98');
    
    phantom.exit();
}


// ----------------------- Globals ---------------------------------------------

var testPzh0 = {
        email    : system.args[1],
        passwd   : system.args[2],
        fullname : system.args[3]
    },
    testPzh1 = {
        email    : system.args[4],
        passwd   : system.args[5],
        fullname : system.args[6]
    },
    theOtherProviderName = system.args[7];
    
console.log('\nTest with Gmail accounts:');
console.log('Account name: ' + testPzh0.email +
            '   passwd: '    + testPzh0.passwd +
            '   fullname: '  + testPzh0.fullname);
console.log('Account name: ' + testPzh1.email +
            '   passwd: '    + testPzh1.passwd +
            '   fullname: '  + testPzh1.fullname);
console.log('The other Provider [' + theOtherProviderName + '] should already be running with a PZH enrolled.\n');

var expected0 = { literalName : 'NAME: ' + testPzh0.fullname.toUpperCase() },
    expected1 = { literalName : 'NAME: ' + testPzh1.fullname.toUpperCase() },
    lowercaseName0 = testPzh0.fullname.toLowerCase();

var address = 'https://localhost',
    // testPzh0 to enroll with another Provider
    interprovider_pzhTobeConnected = testPzh0,
    interprovider_pzhTobeConnected_address = theOtherProviderName + '/' + interprovider_pzhTobeConnected.email + '@gmail.com',
    jquery = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
  
var page = require('webpage').create(),
    t = Date.now(),
    pzhCount = 0;
    

// ----------------------- Start test ------------------------------------------
    
console.log('[TEST] [PZH Enrolment and Inter-Zone Connection] running test...');

enrollPzh(global['testPzh' + pzhCount]);


// ----------------------- Test Enrolment --------------------------------------

function getDuration() {
    var duration = Date.now() - t;
    t = Date.now();
    return duration;
}

//
// This function wraps webpage.evaluate, and offers the possibility to pass
// parameters into the webpage function.
//
function evaluate(page, func) {
    var args = [].slice.call(arguments, 2);
    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
    return page.evaluate(fn);
}

function finishLoadPzhDashboard(status) {
    console.log('......PZH Dashboard for PZH[' + global['testPzh' + pzhCount].email + '] loaded. Loading time ' + getDuration() + ' ms');
    
    var actuals = page.evaluate(function () {
        return {literalName : $('h3')[5].innerText};
    });
    
    if (actuals.literalName == global['expected' + pzhCount].literalName) {
        console.log('...>> [PZH Enrolment] PZH[' + global['testPzh' + pzhCount].email + '] SUCCESS.');
        pzhCount++;
        if (pzhCount < 2) {
            page.onLoadFinished = undefined;
            phantom.clearCookies();
            enrollPzh(global['testPzh' + pzhCount]);
        } else {
            innerproviderConnection();
        }
    } else {
        console.log('...>> [PZH Enrolment] FAILED to get a correct PZH Dashboard.');
    }
}

// Google Accounts signin
function signedIn(status) {
    if (page.title != 'PZH Dashboard') {
        // Continue OpenID authentication
        
        console.log('......Page (title) [' + page.title + '] loaded. Loading time ' + getDuration() + ' ms');
        
        page.evaluate(function () {
            document.getElementById('approve_button').click();
        });
        page.onLoadFinished = finishLoadPzhDashboard;
    } else {
        finishLoadPzhDashboard(status);
    }
}

function signin(testPzh) {
    evaluate(page, function (pzh) {
        document.getElementById('Email').value = pzh.email;
        document.getElementById('Passwd').value = pzh.passwd;
        document.getElementById('PersistentCookie').checked = false;
        document.getElementById('signIn').click();
    }, testPzh);
                
    //page.render('signin' + pzhCount + '.png');
    page.onLoadFinished = signedIn;
}

function enrollPzh(testPzh) {
    page.open(address, function (status) {
        // PZH Login page.
        
        if (status !== 'success') {
            console.log('...>> [PZH Enrolment] test FAILED to load the address.');
            phantom.exit();
        }
        // page.render('landingpage' + pzhCount + '.png');
        console.log('......Landing page [' + pzhCount + '] loaded. Loading time ' + getDuration() + ' ms');
        
        page.includeJs(jquery, function () {
            page.evaluate(function () {
                $(':button')[0].click();
            });
            
            // TODO: Need to traverse all Google authentication workflows.
            page.onLoadFinished = function (status) {
                console.log('......Google Login page loaded. Loading time ' + getDuration() + ' ms');
                        
                var e = document.getElementById('link-force-reauth');
                if (e != null) {
                    page.open(e.href, function (status) {
                        signin(testPzh);
                    });
                } else {
                    signin(testPzh);
                    return;
                }
            };
        });
    });
}


// ----------------------- Test Inner-Provider Interconnection -----------------

function innerproviderConnection() {
    console.log('\n...>> [PZH Inner-Provider-connection] test started.');
    
    page.evaluate(function () {
        $("#connectPzh").click();
    });
    
    page.onConsoleMessage = function (msg) {
        if (msg.indexOf('getZoneStatus') != -1) {
            var peer_pzh = evaluate(page, function (expected_name) {
                var e = document.getElementById('pzh_list');
                if (e != null) {
                    for (var i = 0; i < e.length; i++){
                        if (e.options[i].text.toLowerCase() == expected_name) {
                            var pzh = e.options[i];
                            break;                      
                        }
                    }                    
                }
                return pzh;
            }, lowercaseName0);

            //page.render('connectPzh.png');
                        
            if (peer_pzh != null && peer_pzh.text.toLowerCase() == lowercaseName0) {
                gotPeerPzh(peer_pzh.text);
            } else {
                console.log('...>> [PZH Inner-Provider-connection] test FAILED to get the peer PZH.');
                console.log('[TEST] [PZH Enrolment and Inner-Provider-connection] test done. FAILED at PZH Inner-Provider-connection.');
                
                // Whole test ends.
                phantom.exit();
            }
        }
    };
}

function gotPeerPzh(peerPzh) {
    console.log('......Got peer PZH listed as: ' + peerPzh);
   
    page.evaluate(function () {
        $(':button')[0].click();
    });
    
    page.onConsoleMessage = undefined;
    page.onLoadFinished = function (status) {
        // The button 'Connect Pzh' is clicked.
        console.log('......PZH Connection page loaded. Loading time ' + getDuration() + ' ms');
        
        // Test.
        var gotit = evaluate(page, function (pzh) {
            if ($('.disconnected') != null && $('.disconnected')[0].title.split('_')[1] == pzh.email + '@gmail.com') {
                return 'PASSED';
            } else {
                return 'FAILED';
            }
        }, testPzh0);
        console.log('...>> [PZH Inner-Provider-connection] test ' + gotit);
                        
        page.render('inner-provider.png');
        
        cleanup();
    }
}

function cleanup() {
    console.log('...>> [PZH Inner-Provider-connection] cleaning up... ');
    page.evaluate(function () {
        $('input:image')[0].click();
    });
    
    page.onAlert = function (msg) {
        // Remove the Alert and let the process continue.
        page.reload();
 
        console.log('...>> [PZH Inner-Provider-connection] cleaning up done.');
        
        // Continue 
        // PREREQUISITE: Another Provider is running and the other PZH is
        // running.
        page.onConsoleMessage = interproviderConnect;
    };
}


// ----------------------- Test Inter-Provider Interconnection -----------------

function interproviderCleanup() {
    console.log('...>> [PZH Inter-Provider-connection] cleaning up...');
    page.evaluate(function () {
        $("input:image")[0].click();
    });
    
    page.onAlert = function (msg) {
        page.onAlert = undefined;
        console.log('...>> [PZH Inter-Provider-connection] cleaning up done.');
        console.log('[TEST] [PZH Enrolment and Inter-Zone Connection] test done.\n');
        // Clear any suspicious pending events.
        page.reload();
        phantom.exit();
    };
}

function connected() {
    console.log('......Page4 (title) [' + page.title + '] loaded. Loading time ' + getDuration() + ' ms');    
    // There should be a transit page, automatically redirecting to the PZH
    // Dashboard.
    if (page.title == 'PZH Successful Certificate Exchange') {
        page.evaluate(function () {
            // Go to PZH Dashboard manually.       
            (document.getElementsByTagName('a'))[0].click();
        });
    }
    
    // Page PZH Dashboard.
    page.onLoadFinished = undefined;
    page.onConsoleMessage = function () {
        page.onConsoleMessage = undefined;
        var gotit = evaluate(page, function (expectedPzh) {
            if ($('.disconnected') != null && $('.disconnected')[0].title.split('_')[1] == expectedPzh.email + '@gmail.com') {
                return 'PASSED';
            } else {
                return 'FAILED';
            }
        }, interprovider_pzhTobeConnected);
        
        console.log('...>> [PZH Inter-Provider-connection] test ' + gotit);
        interproviderCleanup();
    }
    
    // Screenshot Page4.
    page.render('inter-provider.png');
}

function googleSignin() {
        page.evaluate(function () {
            if (document.getElementById('approve_button') != null) {
                document.getElementById('approve_button').click();
            }
        });
        page.onLoadFinished = connected;
}

function googlePage() {
    console.log('......Page3 (title) [' + page.title + '] loaded. Loading time ' + getDuration() + ' ms');
    
    var e = document.getElementById('link-force-reauth');
    if (e != null) {
        page.open(e.href, function (status) {
            googleSignin();
        });
    } else {
        googleSignin();
    }
    
    //page.render('page3.png');
}

function pzhLogin(status) {
    // PZH login OpenID page.
    console.log('......Page1 (title) [' + page.title + '] loaded. Loading time ' + getDuration() + ' ms');

    evaluate(page, function (tobeConnected) {
        document.getElementById('connectPzhId').value = tobeConnected;
        // There are two input:buttons on the page. The 2nd one is for
        // connecting with PZH address.
        //$(':button')[1].click();
        (document.getElementsByTagName('input'))[2].click();
    }, interprovider_pzhTobeConnected_address);
    
    //page.render('page1.png');
    
    page.onLoadFinished = function (status) {
        console.log('......Page2 (title) [' + page.title + '] loaded. Loading time ' + getDuration() + ' ms');
        if (page.title == '') {
            console.log('\n...>> [PZH Inter-Provider-connection] test error: please check the command line parameters, e.g., whether <the other Provider name> is correct.');
            
            phantom.exit();
        }

        page.evaluate(function () {
            // Use Google Account.
            (document.getElementsByTagName('input'))[0].click();
        });
        
        page.onLoadFinished = googlePage;
        
        //page.render('page2.png');
    };
}

// Connect to a PZH with another Provider.
function interproviderConnect(msg) {
    if (msg.indexOf('getZoneStatus') != -1) {
        page.onConsoleMessage = undefined;

        console.log('\n...>> [PZH Inter-Provider-connection] test started.');
    
        page.evaluate(function () {
            $("#connectPzh").click();
        });

        page.onConsoleMessage = undefined;
        page.onLoadFinished = pzhLogin;
    }
}

// ....................... End .................................................

