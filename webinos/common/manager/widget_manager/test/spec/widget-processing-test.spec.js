(function () {

    /*
    Require modules
    */
    var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	widgetmanager = require('../../index.js'),
	wm = widgetmanager.widgetmanager;
    widgetmanager.Config.w3cTestMode = true;
    widgetmanager.Logger.setLogLevel(0);

    /*
    process.on('uncaughtException',function(e) {
    console.log("Caught unhandled exception: " + e);
    console.log(" ---> : " + e.stack);
    });
    */

    /*
    Helper
    */
    function WidgetTestProcessor(wgtPath) {
        this.path = WidgetTestProcessor.suitePath + wgtPath;
    }

    /*
    ToDo - parameterise this path
    */
    //WidgetTestProcessor.suitePath = '/home/toby/dev/2006/waf/widgets/test-suite/test-cases/';
    WidgetTestProcessor.suitePath = '/home/ivan/2006/waf/widgets/test-suite/test-cases/';


    WidgetTestProcessor.prototype.process = function (finished, runTests) {
        var that = this;

        function processResult(res) {
            /*
            if (res.status) {
            console.log('**** Invalid widget - process result status: ' + res.status);
            } else {
            console.log(util.inspect(res.widgetConfig));
            }
            */

            // Cancel the install at this point, as we have the config
            if (res.getInstallId() !== undefined) {
                try { wm.abortInstall(res.getInstallId()); } catch (e) { }
            }

            if (runTests) {
                try {
//                    console.log("");
//                    console.log(res.getInstallId());
//                    console.log(that.path);

                    // Pass the widget config on to the test callback.
                    runTests(res.widgetConfig);

                    // Signal that the tests have finished.
                    finished();
                } catch (e) {
                    // An exception occurred during execution of the tests.
                    if (e.message) {
                        console.log("caught exception: " + e.message);
                        expect(e.message).toBeUndefined();
                    } else {
                        var caughtException = true;
                        expect(caughtException).toBeFalsy();
                    }
                    finished();
                }

            }
        }

        //        console.log("");
        //        console.log("processing " + this.path);

        // Ask the widget manager to install the widget, and call us back with the result.
        wm.prepareInstall(this.path, {}, processResult);
    }

    function testWidget(path, finished, tests) {
        var proc = new WidgetTestProcessor(path);
        proc.process(finished, tests);
    }

    /*
    TESTS START
    */
    /*
    Tests for defaultlocale-ignore
    */
    describe('ta-defaultlocale-ignore', function () {
        it('ta-defaultlocale-ignore/000/dlocignore00.wgt - Tests that an empty defaultlocale attribute is ignored (and does not cause the widget to be treated as invalid). To pass the widget but simply run',
		function (done) {
		    testWidget('ta-defaultlocale-ignore/000/dlocignore00.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		    });
		});

        it('ta-defaultlocale-ignore/001/ta-de-001.wgt - Tests that the user agent applies rule for getting a single attribute value to the defaultlocale attribute. To pass, the name of the widget must be the value PASS.',
		function (done) {
		    testWidget('ta-defaultlocale-ignore/001/ta-de-001.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});

        it('ta-defaultlocale-ignore/002/ta-de-002.wgt - Test that the user agent matches obscure, yet valid, language tags. To pass, the widgets description must be the value PASS.',
		function (done) {
		    testWidget('ta-defaultlocale-ignore/002/ta-de-002.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual('PASS');
		    });
		});

        it('ta-defaultlocale-ignore/003/ta-de-003.wgt - Tests that a language tag already part of the UA\'s locales list is ignored when it is repeated for defaultlocale attribute. To pass, the specified value should not be added twice to the locales list of the UA.',
		function (done) {
		    testWidget('ta-defaultlocale-ignore/003/ta-de-003.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});

        it('ta-defaultlocale-ignore/004/ta-de-004.wgt - Tests that the default locale is added to the end of the user agent\'s locale list (and does not override the default language, which is assumed to be "en"). To pass, the name of the widget must be PASS.',
		function (done) {
		    testWidget('ta-defaultlocale-ignore/004/ta-de-004.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
    });

    /*
    Tests for defaultlocale-process	
    */

    describe('ta-defaultlocale-process', function () {
        it('ta-defaultlocale-usage/000/locales/en-gb/index.html - Tests that the value of defaultlocale is also used to in folder-based localization. To pass, the index.html of the folder \'locales/esx-al/\' should be loaded and say PASS.',
		function (done) {
		    testWidget('ta-defaultlocale-usage/000/ta-de-000.wgt', done, function (cfg) {
		        // Requires user interaction/visual check.
		        expect("todo").toEqual("done");
		    });
		});

        it('ta-defaultlocale-usage/001/dlocuse01.wgt - Tests that the value of defaultlocale works in conjunction to xml:lang on the widget element.		To pass, the name of the widget must be PASS.',
		function (done) {
		    testWidget('ta-defaultlocale-usage/001/dlocuse01.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
    });

    /*
    Tests for ta-ACCJfDGwDQ
    */

    describe('ta-ACCJfDGwDQ', function () {

        it('ta-ACCJfDGwDQ/000/aa.wgt - Tests that the UA rejects configuration documents that don\'t have correct widget element at the root. To pass, the UA must treat this as an invalid widget (the root element is not widget).',
		function (done) {
		    testWidget('ta-ACCJfDGwDQ/000/aa.wgt', done, function (cfg) {
		        // For an invalid widget, we expect the config to be undefined.
		        expect(cfg).toBeUndefined();
		    });
		});

        it('ta-ACCJfDGwDQ/001/ab.wgt - Tests that the UA rejects configuration documents that don\'t have correct widget element at the root. To pass, the UA must treat this as an invalid widget (the namespace is wrong).',
		function (done) {
		    testWidget('ta-ACCJfDGwDQ/001/ab.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});

        it('ta-ACCJfDGwDQ/002/ac.wgt - Tests that the UA rejects configuration documents that don\'t have correct widget element at the root.To pass, the UA must treat this as an invalid widget (the namespace is missing).',
		function (done) {
		    testWidget('ta-ACCJfDGwDQ/002/ac.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    /* 
    Tests for ta-argMozRiC
    */

    describe('ta-argMozRiC', function () {

        it('ta-argMozRiC/000/af.wgt - Test that a user agent correctly processes a author element. To pass, the author name must be the string "PASS".',
		function (done) {
		    testWidget('ta-argMozRiC/000/af.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual('PASS');
		    });
		});

        it('ta-argMozRiC/001/ag.wgt - Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space. To pass, the widget author must be the string "P A S S" (i.e., white space collapsed to single space).',
		function (done) {
		    testWidget('ta-argMozRiC/001/ag.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual('P A S S');
		    });
		});

        it('ta-argMozRiC/002/ah.wgt - Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the author name must be the string "PASS" (i.e., all white space collapsed to single space, spaces at start/end trimmed).',
		function (done) {
		    testWidget('ta-argMozRiC/002/ah.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-argMozRiC/003/ai.wgt - Test that a user agent correctly applies the rule for getting a single attribute value.	To pass, the author email must be the string "PASS".',
		function (done) {
		    testWidget('ta-argMozRiC/003/ai.wgt', done, function (cfg) {
		        expect(cfg.author.email).toEqual('PASS');
		    });
		});
        it('ta-argMozRiC/004/aj.wgt - Test that a user agent correctly applies the rule for getting a single attribute value and the Rule for Getting Text Content with normalized White Space.To pass, the author name must be the string "PASS".',
		function (done) {
		    testWidget('ta-argMozRiC/004/aj.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-argMozRiC/005/ak.wgt - Test that a user agent correctly applies the rule for getting a single attribute value and the Rule for Getting Text Content with Normalized White Space.	To pass, the author name must be the string "PASS".',
		function (done) {
		    testWidget('ta-argMozRiC/005/ak.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-argMozRiC/006/al.wgt - Test the ability of the user agent to handle an empty author element.	To pass, the author name must be an empty string.',
		function (done) {
		    testWidget('ta-argMozRiC/006/al.wgt', done, function (cfg) {
		        expect(cfg.author.name).toBeUndefined();
		    });
		});
        it('ta-argMozRiC/007/am.wgt - Test the ability of the user agent to correctly process the author href attribute.	To pass, the value of author href must be "PASS:PASS".',
		function (done) {
		    testWidget('ta-argMozRiC/007/am.wgt', done, function (cfg) {
		        expect(cfg.author.href).toEqual('PASS:PASS');
		    });
		});
        it('ta-argMozRiC/008/an.wgt - Test the ability of the user agent to correctly process the author href attribute.	To pass, the value of author href must be ignored.',
		function (done) {
		    testWidget('ta-argMozRiC/008/an.wgt', done, function (cfg) {
		        expect(cfg.author.href).toBeUndefined();
		    });
		});

    });

    /* 
    Tests for ta-AYLMhryBnD
    */

    describe('ta-AYLMhryBnD', function () {
        it('ta-AYLMhryBnD/000/ao.wgt - Test that a user agent correctly processes a name element.	To pass, the widget name must be the string "PASS".',
		function (done) {
		    testWidget('ta-AYLMhryBnD/000/ao.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-AYLMhryBnD/001/ap.wgt - Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the widget name must be the string "P A S S" (i.e., white space collapsed to single space).',
		function (done) {
		    testWidget('ta-AYLMhryBnD/001/ap.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('P A S S');
		    });
		});
        it('ta-AYLMhryBnD/002/aq.wgt - Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the widget name must be the string "PASS" (i.e., all white space collapsed to single space, spaces at front/back trimmed).',
		function (done) {
		    testWidget('ta-AYLMhryBnD/002/aq.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-AYLMhryBnD/003/ar.wgt - Test that a user agent correctly applies the rule for getting a single attribute value.	To pass, the widget short name must be the string "PASS".',
		function (done) {
		    testWidget('ta-AYLMhryBnD/003/ar.wgt', done, function (cfg) {
		        expect(cfg.shortName.unicode).toEqual('PASS');
		    });
		});
        it('ta-AYLMhryBnD/004/as.wgt - Test that a user agent correctly applies the rule for getting a single attribute value and	the Rule for Getting Text Content with Normalized White Space.	To pass, the widget short name must be the string "PASS" and the widget name must be "PASS".',
		function (done) {
		    testWidget('ta-AYLMhryBnD/004/as.wgt', done, function (cfg) {
		        expect(cfg.shortName.unicode).toEqual('PASS');
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-AYLMhryBnD/005/at.wgt - Test that a user agent correctly applies the rule for getting a single attribute value and	the Rule for Getting Text Content with Normalized White Space.	To pass, the widget short name must be the string "PASS" and the widget name must be "PASS".',
		function (done) {
		    testWidget('ta-AYLMhryBnD/005/at.wgt', done, function (cfg) {
		        expect(cfg.shortName.unicode).toEqual('PASS');
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
        it('ta-AYLMhryBnD/006/au.wgt - Test that a user agent correctly processes the short attribute.	To pass, the widget short name must be an empty string.',
		function (done) {
		    testWidget('ta-AYLMhryBnD/006/au.wgt', done, function (cfg) {
		        expect(cfg.shortName).toBeUndefined();

		    });
		});
        it('ta-AYLMhryBnD/007/av.wgt - Test the ability of the user agent to handle an empty name element.	To pass, the widget name must be an empty string.',
		function (done) {
		    testWidget('ta-AYLMhryBnD/007/av.wgt', done, function (cfg) {
		        expect(cfg.name).toBeUndefined();
		    });
		});
        it('ta-AYLMhryBnD/008/oa.wgt - Test that a user agent correctly processes a name element with xml:lang attribute.	To pass, the widget name must be the string "PASS".',
		function (done) {
		    testWidget('ta-AYLMhryBnD/008/oa.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
    });

    /* 
    Test cases for ta-BnWPqNvNVo
    */
    describe('ta-BnWPqNvNVo', function () {
        it('/ta-BnWPqNvNVo/000/aw.wgt - Test that the user agent does not attempt to load a default start file when a custom start file has been declared.	To pass, the widget start file must point to "pass.html" and the icons list must contain a pointer to "icon.png" at the root of the widget.',
		function (done) {
		    testWidget('ta-BnWPqNvNVo/000/aw.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual('pass.html');
		        expect(cfg.prefIcon).toEqual('icon.png');
		    });
		});
    });
    /*
    Test cases for ta-BxjoiWHaMr
    */
    describe('ta-BnWPqNvNVo', function () {
        it('/ta-BxjoiWHaMr/000/ax.wgt - Test the UA\'s ability process the height attribute.	To pass, the widget height must be either the numeric value 123 or a value greater than 0.',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/000/ax.wgt', done, function (cfg) {
		        expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0);
		    });
		});
        it('/ta-BxjoiWHaMr/001/ay.wgt - Test the UA\'s ability process the height attribute.	To pass, the user agent must ignore the value of the height attribute (the value is composed of characters).',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/001/ay.wgt', done, function (cfg) {
		        expect(cfg.height).toEqual(0);
		    });
		});
        it('/ta-BxjoiWHaMr/002/az.wgt - Test the UA\'s ability process the height attribute.	To pass, the widget height must be the numeric value 100 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/002/az.wgt', done, function (cfg) {
		        expect(cfg.height).toEqual(100) || expect(cfg.height).toBeGreaterThan(0);
		    });
		});
        it('/ta-BxjoiWHaMr/003/a1.wgt - Test the UA\'s ability process the height attribute.	To pass, the widget height must be the numeric value 123 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/003/a1.wgt', done, function (cfg) {
		        expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0);
		    });
		});
        it('/ta-BxjoiWHaMr/004/a2.wgt - Test the UA\'s ability process the height attribute.	To pass, the widget height must be ignored (the value is an empty string, hence it would be ignored).',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/004/a2.wgt', done, function (cfg) {
		        expect(cfg.height).toBeUndefined();
		    });
		});
        it('/ta-BxjoiWHaMr/005/a3.wgt - Test the UA\'s ability process the height attribute.To pass, the widget height must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/005/a3.wgt', done, function (cfg) {
		        expect(cfg.height).toBeUndefined();
		    });
		});
        it('/ta-BxjoiWHaMr/006/a4.wgt - Test the UA\'s ability process the height attribute.	To pass, the widget height must be ignored (the value is an empty string.',
		function (done) {
		    testWidget('ta-BxjoiWHaMr/006/a4.wgt', done, function (cfg) {
                // Bug in test? The value in the widget is -123.
		        expect(cfg.height).toEqual(0);
		    });
		});
    });

    /*
    Test cases for ta-DwhJBIJRQN
    */
    describe('ta-DwhJBIJRQN', function () {
        it('/ta-DwhJBIJRQN/000/a5.wgt - Test that the UA skips preference elements without a name attribute.	To pass, widget preferences must remain an empty list (i.e., the preference is skipped).',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/000/a5.wgt', done, function (cfg) {
		        expect(cfg.preferences).toBeUndefined();
		    });
		});
        it('/ta-DwhJBIJRQN/001/a6.wgt - Test that the UA skips preference element already defined.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/001/a6.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("PASS");
		        expect(cfg.preferences[0].value).toEqual("PASS");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		    });
		});
        it('/ta-DwhJBIJRQN/002/a7.wgt - Test that the UA does a case sensitive comparison on the value of the readonly attribute.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/002/a7.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("PASS");
		        expect(cfg.preferences[0].value).toEqual("PASS");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		    });
		});
        it('/ta-DwhJBIJRQN/003/a8.wgt - Test that the UA does a case sensitive comparison on the value of the readonly attribute.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "true".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/003/a8.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("PASS");
		        expect(cfg.preferences[0].value).toEqual("PASS");
		        expect(cfg.preferences[0].readonly).toBeTruthy();
		    });
		});
        it('/ta-DwhJBIJRQN/004/a9.wgt - Test that the UA sets the readonly attribute to false by default.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/004/a9.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("PASS");
		        expect(cfg.preferences[0].value).toEqual("PASS");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		    });
		});
        it('/ta-DwhJBIJRQN/005/ba.wgt - Test that the UA skips multiple preference element already defined.	To pass, widget preference must contain one preference whose name is "a" and whose value is "a" and whose readonly attr value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/005/ba.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("a");
		        expect(cfg.preferences[0].value).toEqual("a");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		    });
		});
        it('/ta-DwhJBIJRQN/006/bb.wgt - Test the UA\'s ability store preferences whose name vary only in case.	To pass, widget preference must contain two preferences: 1 must have a name "a" and whose value is "a" and whose readonly attr value must be "false". 2 must have a name "A" and whose value is "b" and whose readonly attribute value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/006/bb.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(2);
		        expect(cfg.preferences[0].name).toEqual("a");
		        expect(cfg.preferences[0].value).toEqual("a");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		        expect(cfg.preferences[1].name).toEqual("A");
		        expect(cfg.preferences[1].value).toEqual("b");
		        expect(cfg.preferences[1].readonly).toBeFalsy();
		    });
		});
        it('/ta-DwhJBIJRQN/007/bc.wgt - Tests that the UA applies the rule for getting a single attribute value to name, value, and readonly attributes.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function (done) {
		    testWidget('ta-DwhJBIJRQN/007/bc.wgt', done, function (cfg) {
		        expect(cfg.preferences.length).toEqual(1);
		        expect(cfg.preferences[0].name).toEqual("PASS");
		        expect(cfg.preferences[0].value).toEqual("PASS");
		        expect(cfg.preferences[0].readonly).toBeFalsy();
		    });
		});
    });
    /*
    Test cases for ta-dxzVDWpaWg
    */
    describe('ta-dxzVDWpaWg', function () {
        it('/ta-dxzVDWpaWg/000/bg.wgt - Test to make sure that the UA only checks the root of the widget for config files, and not in an arbitrary folder.	To pass, the user agent must treat this widget as an invalid widget (config file is not at the root).',
		function (done) {
		    testWidget('ta-dxzVDWpaWg/000/bg.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('/ta-dxzVDWpaWg/001/bh.wgt - Test to make sure that the UA only checks the root of the widget for config files, and not in a locale folder.	To pass, the user agent must treat this widget as an invalid widget (config file is not at the root, but in locale folder).',
		function (done) {
		    testWidget('ta-dxzVDWpaWg/001/bh.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    /*
    Test cases for ta-FAFYMEGELU
    */
    describe('ta-FAFYMEGELU', function () {
        it('/ta-FAFYMEGELU/000/bj.wgt - Tests the UA\'s ability to locate an icon at the root of the widget. To pass, after processing, the icons list must contain "icon.png",	which is at the root of the widget.',
		function (done) {
		    testWidget('ta-FAFYMEGELU/000/bj.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual("icon.png");//Ivan: I think perhaps that cfg.icons is not the correct way of of accessing the icons array. All tests involving cfg.icons throw errors. Icons appears to be an asociative array, does this matter? Also should we be using expect(x).toContain(y) for checking contents of array? error: cannot read property length of undefined.
		    });
		});
        it('/ta-FAFYMEGELU/001/bk.wgt - Tests the UA\'s ability to locate an icon in a locale folder.	To pass, after processing, the icons list must contain a pointer to "locales/en/icon.png"',
		function (done) {
		    testWidget('ta-FAFYMEGELU/001/bk.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toBeGreaterThan(0);
		        expect(cfg.icons[0].path).toEqual("locales/en/icon.png"); //Ivan: Test failing due to cfg.icons, cannot read property length of undefined.
		    });
		});
        it('/ta-FAFYMEGELU/002/bl.wgt - Tests the UA\'s ability to locate an icon in a locale folder and at the root of the widget.	To pass, after processing, the icons list must contain a pointer to "locales/en/icon.jpg", and "icon.png", which is at the root of the widget.	The icons list can be in any order, so long as it contains "icon.png" and "locales/en/icon.jpg".',
		function (done) {
		    testWidget('ta-FAFYMEGELU/002/bl.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toEqual(2);
		        if (cfg.icons[0].path == "locales/en/icon.jpg")
		            expect(cfg.icons[1].path).toEqual("icon.png");
		        else if (cfg.icons[0].path == "icon.png")
		            expect(cfg.icons[1].path).toEqual("locales/en/icon.png");
		        else
		            expect(correctIcons).toBeDefined(); //Ivan: Test failing due to cfg.icons, cannot read property length of undefined.
		    });
		});
        it('/ta-FAFYMEGELU/003/bm.wgt - Tests the UA\'s ability to deal with custom icon declaration in the config document and matching default icons.	To pass, the icons list must contain a pointer to "locales/en/icon.jpg", and "icon.png", which is at the root of the widget.	The icons list can be in any order, so long as it contains "icon.png" and "locales/en/icon.jpg".',
		function (done) {
		    testWidget('ta-FAFYMEGELU/003/bm.wgt', done, function (cfg) {
		        expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
		        expect(cfg.icons["icon.png"]).toBeDefined();//Ivan: No reason given for test fail
		    });
		});
        it('/ta-FAFYMEGELU/004/bn.wgt - Tests the UA\'s ability to deal with custom icon declarations in the config document and matching default icons. To pass, the icons list must contain a pointer to "icons/pass.png", and "locales/en/icon.png" (ordering of the items in the list is irrelevant).',
		function (done) {
		    testWidget('ta-FAFYMEGELU/004/bn.wgt', done, function (cfg) {
		        expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
		        expect(cfg.icons["icons/pass.png"]).toBeDefined(); //Ivan: No reason given for test fail.
		    });
		});
        it('/ta-FAFYMEGELU/005/bo.wgt - Test the UA\'s ability to load default icons in the correct order.	To pass, the icons list must contain "icon.png" and \'icon.jpg\'.',
		function (done) {
		    testWidget('ta-FAFYMEGELU/005/bo.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons[0].path).toEqual("icon.png");
		        expect(cfg.icons[1].path).toEqual("icon.jpg");//Ivan: Fails due to not being able to read properties of cfg.icons (undefined)
		    });
		});
        it('/ta-FAFYMEGELU/006/bp.wgt - Test the UA\'s ability to load default icons.	To pass, the icons list must contain a pointer to "locales/en/icon.png" (order in the list is not relevant).',
		function (done) {
		    testWidget('ta-FAFYMEGELU/006/bp.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons[0].path).toEqual("locales/en/icon.png");//Ivan: Fails due to not being able to read properties of cfg.icons (undefined)
		    });
		});
        it('/ta-FAFYMEGELU/007/ad.wgt - Tests if the UA treats file names in the default icons files table case-sensitively.To pass, the icons list must only contain a pointer to "icon.png"	at the root of the widget.',
		function (done) {
		    testWidget('ta-FAFYMEGELU/007/ad.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual("icon.png");//Ivan: Fails due to not being able to read properties of cfg.icons (undefined)
		    });
		});
        it('/ta-FAFYMEGELU/008/ae.wgt - Tests if the UA treats file names in the default icons files table case-sensitively.To pass, the icons list must only contain a pointer to "locales/en/icon.png".',
		function (done) {
		    testWidget('ta-FAFYMEGELU/008/ae.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual("locales/en/icon.png");//Ivan: Fails due to not being able to read properties of cfg.icons (undefined)
		    });
		});
    });
    /*
    Tests for ta-hkWmGJgfve
    */
    describe('ta-hkWmGJgfve', function () {
        it('/ta-hkWmGJgfve/000/bq.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the content element. To pass, the widget start file must be "pass.html".',
		function (done) {
		    testWidget('ta-hkWmGJgfve/000/bq.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.html");
		    });
		});
        it('/ta-hkWmGJgfve/001/br.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the content element.	To pass, the widget must be treated by the user agent as an invalid widget.',
		function (done) {
		    testWidget('ta-hkWmGJgfve/001/br.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined(); //Ivan: Fails, widget is not being set to invalid despite duplicate content elements
		    });
		});
        it('/ta-hkWmGJgfve/002/bs.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the content element.To pass, the widget start file must be "pass.html".',
		function (done) {
		    testWidget('ta-hkWmGJgfve/002/bs.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.html");
		    });
		});
    });
    /*
    Test cases for ta-klLDaEgJeU
    */
    describe('ta-klLDaEgJeU', function () {
        it('/ta-klLDaEgJeU/000/bt.wgt - Test to make sure the user agent rejects malformed XML.	To pass, the widget must be treated as invalid by the user agent.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/000/bt.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('		/ta-klLDaEgJeU/001/bu.wgt - Test to make sure the user agent rejects malformed XML.	To pass, the widget must be treated as invalid by the user agent.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/001/bu.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('/ta-klLDaEgJeU/002/bv.wgt - Tests support of XML, XMLNS, and UTF-8.	To pass, the user agent must load \'pass&amp;.html\' as the start file.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/002/bv.wgt', done, function (cfg) {
			expect(cfg.startFile).toEqual("pass&amp;.html"); //Ivan: cfg is undefined, widget falling over on start files?
		    });
		});
        it('/ta-klLDaEgJeU/003/bw.wgt - Tests support of XML, XMLNS, and UTF-8. To pass, the widget author must be the string \'PASS\'.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/003/bw.wgt', done, function (cfg) {
		        expect(cfg.author.name.unicode).toEqual("PASS")//Ivan: cfg is undefined, widget falling over on author?
		    });
		});
        it('/ta-klLDaEgJeU/004/lt.wgt - Tests support of XML, by making sure the user agent treats &lt; as malformed XML. To pass, the user agent must treat this as an invalid widget.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/004/lt.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('/ta-klLDaEgJeU/005/amp.wgt - Tests support of XML, by making sure the user agent treats &amp; as malformed XML. To pass, the user agent must treat this as an invalid widget.',
		function (done) {
		    testWidget('ta-klLDaEgJeU/005/amp.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    /*
    Tests for ta-LYLMhryBBT
    */
    describe('ta-klLDaEgJeU', function () {
        it('/ta-LYLMhryBBT/000/bx.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be "PASS"..',
		function (done) {
		    testWidget('ta-LYLMhryBBT/000/bx.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
        it('/ta-LYLMhryBBT/001/by.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be an empty string.',
		function (done) {
		    testWidget('ta-LYLMhryBBT/001/by.wgt', done, function (cfg) {
		        expect(cfg.name).toEqual(''); //Ivan: code in wigetconfigprocessor.js doesn't seem to have a check for repeated name elements.
		    });
		});
        it('/ta-LYLMhryBBT/002/bz.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be "PASS".',
		function (done) {
		    testWidget('ta-LYLMhryBBT/002/bz.wgt', done, function (cfg) {
		        expect(cfg.name.unicode).toEqual('PASS');
		    });
		});
    });
    /*
    Tests for ta-RawAIWHoMs
    */
    describe('ta-RawAIWHoMs', function () {
        it('/ta-RawAIWHoMs/000/b1.wgt - Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must be "pass:".',
		function (done) {
		    testWidget('ta-RawAIWHoMs/000/b1.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual('pass:');
		    });
		});
        it('/ta-RawAIWHoMs/001/rd.wgt - Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must ignore the value (not a valid IRI).',
		function (done) {
		    testWidget('ta-RawAIWHoMs/001/rd.wgt', done, function (cfg) {
		        expect(cfg.id).toBeUndefined();
		    });
		});
        it('/ta-RawAIWHoMs/002/b2.wgt - Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must equal "pass:" (applies rule for getting a single attribute value).',
		function (done) {
		    testWidget('ta-RawAIWHoMs/002/b2.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual('pass:');
		    });
		});
        it('/ta-RawAIWHoMs/id-empty/id-empty.wgt - Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, id the attribute is ignored, as it is an empty string.',
		function (done) {
		    testWidget('ta-RawAIWHoMs/id-empty/id-empty.wgt', done, function (cfg) {
		        expect(cfg.id).toBeUndefined();
		    });
		});
        it('/ta-RawAIWHoMs/id-empty-with-spaces/id-empty-with-spaces.wgt - Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, id the attribute is ignored, as it is an empty string.',
		function (done) {
		    testWidget('ta-RawAIWHoMs/id-empty-with-spaces/id-empty-with-spaces.wgt', done, function (cfg) {
		        expect(cfg.id).toBeUndefined();
		    });
		});
    });
    /*
    Test cases for ta-RGNHRBWNZV
    */
    describe('ta-RawAIWHoMs', function () {
        it('/ta-RGNHRBWNZV/008/cc.wgt - Tests the user agent\'s ability to select start files in the appropriate order.	To pass, the user agent must select index.htm as the start file.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/008/cc.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
        it('/ta-RGNHRBWNZV/009/cv.wgt - Tests the user agent\'s ability to select start files in the appropriate order.	To pass, the user agent must select  index.html as the start file.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/009/cv.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.html");
		    });
		});
        it('/ta-RGNHRBWNZV/000/b3.wgt - Tests to see if the user agents applies the algorithm to locate a default start file, when no custom start file is present.	To pass, index.htm must be the widget start file and the start file content-type must be text/html.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/000/b3.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		        expect(cfg.startFile.contentType).toEqual("text/html"); //Ivan: This is incorrect, test for index.htm appears to pass but type check does not.
		    });
		});
        it('/ta-RGNHRBWNZV/001/b4.wgt - Tests to see if the user agents applies the algorithm to locate a default start file, when no custom start file is present.	To pass, index.html must be the widget start file and the start file content-type must be text/html.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/001/b4.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.html");
		        expect(cfg.startFile.contentType).toEqual("text/html");//Ivan: Again it's failing on the type check (correct syntax)
		    });
		});
        it('/ta-RGNHRBWNZV/002/b0.wgt - Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/002/b0.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined(); //Ivan: line 391 widgetprocessor.js, does not appear to check for case.
		    });
		});
        it('/ta-RGNHRBWNZV/003/c1.wgt - Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/003/c1.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined(); //Ivan: Is not checking for case sensitivity when comparing to STARTFILE_NAMES, line 381 widgetprocessor.js
		    });
		});
        it('/ta-RGNHRBWNZV/004/c2.wgt - Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/004/c2.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: Is not checking for case sensitivity when comparing to STARTFILE_NAMES, line 381 widgetprocessor.js
		    });
		});
        it('/ta-RGNHRBWNZV/005/c3.wgt - Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/005/c3.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined(); //Ivan: Is not checking for case sensitivity when comparing to STARTFILE_NAMES, line 381 widgetprocessor.js
		    });
		});
        it('/ta-RGNHRBWNZV/006/c4.wgt - Tests the UAs ability treat file names in the default start files table case-sensitively.	To pass, the user agent must ignore "INdeX.htm" at the root, but must use "index.html" as the default start file.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/006/c4.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.html");
		    });
		});
        it('/ta-RGNHRBWNZV/007/c5.wgt - Tests the UAs ability treat file names in the default start files table case-sensitively.	To pass, the user agent must ignore "INdeX.htm" in the locales folder, but must use "index.html" as the default start file.',
		function (done) {
		    testWidget('ta-RGNHRBWNZV/007/c5.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.html");
		    });
		});
    });
    /*
    Test cases for ta-RRZxvvTFHx
    */
    describe('ta-RRZxvvTFHx', function () {
        it('/ta-RRZxvvTFHx/000/b5.wgt - Tests that a UA does not go searching in an arbritrary folder ("abc123") for default start files.	To pass, the user agent must treat this widget as an invalid widget.',
		function (done) {
		    testWidget('ta-RRZxvvTFHx/000/b5.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined(); //Ivan: Is looking in arbitary folder or has a default start file being set.
		    });
		});
        it('/ta-RRZxvvTFHx/001/b6.wgt - Tests that a UA does not go searching in an arbritrary folder ("foo/bar") for default start files.	To pass, the user agent must use index.html at the root of the widget as the start file',
		function (done) {
		    testWidget('ta-RRZxvvTFHx/001/b6.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.html");
		    });
		});
    });
    /*
    Test cases for ta-sdwhMozwIc
    */
    describe('ta-sdwhMozwIc', function () {
        it('/ta-sdwhMozwIc/000/b7.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be  "PASS", href must be "PASS:" and email must be "PASS".',
		function (done) {
		    testWidget('ta-sdwhMozwIc/000/b7.wgt', done, function (cfg) {
		        expect(cfg.author.name).toEqual("PASS");//Ivan: Author and href are not being set to pass but email is. Syntax error?
		        expect(cfg.author.href).toEqual("PASS");
		        expect(cfg.author.email).toEqual("PASS");
		    });
		});
        it('/ta-sdwhMozwIc/001/b8.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be an empty string.',
		function (done) {
		    testWidget('ta-sdwhMozwIc/001/b8.wgt', done, function (cfg) {
		        expect(cfg.author.name).toEqual("");
		    });
		});
        it('/ta-sdwhMozwIc/002/b9.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be "PASS", href must be "PASS:" and email must be "PASS".',
		function (done) {
		    testWidget('ta-sdwhMozwIc/002/b9.wgt', done, function (cfg) {
		        expect(cfg.author.name).toEqual("PASS");//Ivan: href and email are correct but name is not (does the repeition have the same or no href and email element?
		        expect(cfg.author.href).toEqual("PASS:");
		        expect(cfg.author.email).toEqual("PASS");
		    });
		});
    });
    /* 
    Test cases for ta-UEMbyHERkI
    */
    describe('ta-UEMbyHERkI', function () {
        it('/ta-UEMbyHERkI/000/c6.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be "PASS".',
		function (done) {
		    testWidget('ta-UEMbyHERkI/000/c6.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
        it('/ta-UEMbyHERkI/001/c7.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be an empty string.',
		function (done) {
		    testWidget('ta-UEMbyHERkI/001/c7.wgt', done, function (cfg) {
		        expect(cfg.description).toEqual("");//Ivan: Line 365 widgetconfigprocessor.js does not appear to have any way of checking if description is already set.
		    });
		});
        it('/ta-UEMbyHERkI/002/rb.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be "PASS".',
		function (done) {
		    testWidget('ta-UEMbyHERkI/002/rb.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
        it('/ta-UEMbyHERkI/003/c8.wgt - Tests the UA\'s ability to correctly select the description element when the xml:lang attribute is present.	To pass, the widget description must be "PASS".',
		function (done) {
		    testWidget('ta-UEMbyHERkI/003/c8.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
    });
    /*
    Test cases for ta-UScJfQHPPy
    */
    describe('ta-UScJfQHPPy', function () {
        it('/ta-UScJfQHPPy/000/c9.wgt - Test the UA\'s ability process the width attribute.	To pass, the value of the widget width must be ignored (the value is composed of characters).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/000/c9.wgt', done, function (cfg) {
		        expect(cfg.width).toBeUndefined();//Ivan: Doesn't appear to be anything other than a function to check for negative in widgetconfigprocessor.js line 290.
		    });
		});
        it('/ta-UScJfQHPPy/001/cq.wgt - Test the UA\'s ability process the width attribute.	To pass, the widget width must be the value "123" or a value greater than 0. ',
		function (done) {
		    testWidget('ta-UScJfQHPPy/001/cq.wgt', done, function (cfg) {
		        expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0);
		    });
		});
        it('/ta-UScJfQHPPy/002/cw.wgt - Test the UA\'s ability process the width attribute.	To pass, the widget width must be the numeric value 200 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/002/cw.wgt', done, function (cfg) {
		        expect(cfg.width).toEqual(200) || expect(cfg.width).toBeGreaterThan(0);
		    });
		});
        it('/ta-UScJfQHPPy/003/ce.wgt - Test the UA\'s ability process the width attribute.	To pass, the widget width must be the numeric value 123  or a value greater than 0(resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/003/ce.wgt', done, function (cfg) {
		        expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0);
		    });
		});
        it('/ta-UScJfQHPPy/004/cr.wgt - Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is an empty string, hence it would be ignored).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/004/cr.wgt', done, function (cfg) {

		        expect(cfg.width).toBeGreaterThan(0);//Ivan: Fixed this issue.
		    });
		});
        it('/ta-UScJfQHPPy/005/ct.wgt - Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/005/ct.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0);//Ivan: Should just be assigning width = x after an if switch to check type of width. However doesn't seem to work.
		    });
		});
        it('/ta-UScJfQHPPy/006/cy.wgt - Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
		    testWidget('ta-UScJfQHPPy/006/cy.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0); //Ivan: Should just be assigning width = x after an if switch to check type of width. However doesn't seem to work.
		    });
		});
    });
    /* 
    Test cases for ta-vcYJAPVEym
    */
    describe('ta-UScJfQHPPy', function () {
        it('/ta-vcYJAPVEym/000/cu.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, the widget license be the string "PASS" and license href must be the string "PASS:".',
		function (done) {
		    testWidget('ta-vcYJAPVEym/000/cu.wgt', done, function (cfg) {
		        expect(cfg.license.text.unicode).toEqual("PASS");
		        expect(cfg.license.href).toEqual("PASS:")
		    });
		});
        it('/ta-vcYJAPVEym/001/ci.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, the widget license must be an empty string and widget license href must be ignored.',
		function (done) {
		    testWidget('ta-vcYJAPVEym/001/ci.wgt', done, function (cfg) {
		        expect(cfg.license.text).toEqual(""); //Ivan: Succesfully ignores href but does not ignore repetition of license element. 
		        expect(cfg.license.href).toBeUndefined();
		    });
		});
        it('/ta-vcYJAPVEym/002/ra.wgt - Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, widget license must be "PASS".',
		function (done) {
		    testWidget('ta-vcYJAPVEym/002/ra.wgt', done, function (cfg) {
		        expect(cfg.license.text.unicode).toEqual("PASS");
		    });
		});
        it('/ta-vcYJAPVEym/003/co.wgt - Tests the UA\'s ability to correctly select a license element that makes use of xml:lang.	To pass, widget license must be "PASS".',
		function (done) {
		    testWidget('ta-vcYJAPVEym/003/co.wgt', done, function (cfg) {
		        expect(cfg.license.text.unicode).toEqual("PASS");
		    });
		});
    });
    /*
    Test cases for ta-VdCEyDVSA
    */
    describe('ta-VdCEyDVSA', function () {
        it('/ta-VdCEyDVSA/000/cp.wgt - Test the ability of the user agent to correctly apply the rule for getting text content to a description element.	To pass, the value of the widget description must be the string "PASS".',
		function (done) {
		    testWidget('ta-VdCEyDVSA/000/cp.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
        it('/ta-VdCEyDVSA/001/ca.wgt - Test the ability of the user agent to correctly process the description element.	To pass, the value of the widget description must be the string "PASS".',
		function (done) {
		    testWidget('ta-VdCEyDVSA/001/ca.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
        it('/ta-VdCEyDVSA/002/cs.wgt - Test the ability of the user agent to correctly process the description element.	To pass, the value of the widget description must be an empty string.',
		function (done) {
		    testWidget('ta-VdCEyDVSA/002/cs.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("");//Ivan: Failure, perhaps this isn't  the correct way to check for an empty string, or the description element process cannot handle an empty string.
		    });
		});
        it('/ta-VdCEyDVSA/003/cd.wgt - Test the ability of the user agent to correctly process the description element.To pass, the value of the widget description must be a string that corresponds to the following bytes (ASCII): 0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A',
		function (done) {
		    testWidget('ta-VdCEyDVSA/003/cd.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("\u000A\u0009\u0050\u000A\u0009\u0041\u000A\u0009\u0053\u000A\u0009\u0053\u000A"); //Ivan: Is there something wrong with the ability of the description element processor to deal with none unicode strings?
		    });
		});
        it('/ta-VdCEyDVSA/004/x1.wgt - Test the ability of the user agent to correctly process localized description elements by ignoring languages it does not know (i.e., selecting the unlocalized content).To pass, the value of the widget description must the string "PASS".',
		function (done) {
		    testWidget('ta-VdCEyDVSA/004/x1.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
        it('/ta-VdCEyDVSA/005/x2.wgt - Test the ability of the user agent to correctly process localized description elements.	To pass, the value of the widget description must the string "PASS".',
		function (done) {
		    testWidget('ta-VdCEyDVSA/005/x2.wgt', done, function (cfg) {
		        expect(cfg.description.unicode).toEqual("PASS");
		    });
		});
    });
    /*
    Test cases for ta-VerEfVGeTc
    */
    describe('ta-VerEfVGeTc', function () {
        it('/ta-VerEfVGeTc/000/cf.wgt - Test the UA\'s ability to process version a version attribute.	To pass, the value of widget version must be the string "PASS".',
		function (done) {
		    testWidget('ta-VerEfVGeTc/000/cf.wgt', done, function (cfg) {
		        expect(cfg.version.unicode).toEqual("PASS");
		    });
		});
        it('/ta-VerEfVGeTc/001/cg.wgt - Test the UA\'s ability to process version a version attribute.	To pass, the value of version must be an empty string  (applies rule for getting a single attribute value).',
		function (done) {
		    testWidget('ta-VerEfVGeTc/001/cg.wgt', done, function (cfg) {
		        expect(cfg.version).toEqual(""); //Ivan: Seems to fall down on all empty string tests, either the test is wrong or the processor cannot handle empty elements.
		    });
		});
        it('/ta-VerEfVGeTc/002/ch.wgt - Test the UA\'s ability to process version a version attribute.	To pass, the value of widget version must be the string "PASS" (applies rule for getting a single attribute value).',
		function (done) {
		    testWidget('ta-VerEfVGeTc/002/ch.wgt', done, function (cfg) {
		        expect(cfg.version.unicode).toEqual("PASS");
		    });
		});
    });
    /*
    Test cases for ta-YUMJAPVEgI
    */
    describe('ta-YUMJAPVEgI', function () {
        it('/ta-YUMJAPVEgI/000/cj.wgt - Test the ability of the user agent to correctly apply the rule for getting text content to a license element.	To pass, the value of the widget license must be the string "PASS".',
		function (done) {
		    testWidget('ta-YUMJAPVEgI/000/cj.wgt', done, function (cfg) {
		        expect(cfg.license.unicode).toEqual("PASS");//Ivan: The function for getting the license element content appears to be broken (fails on all tests).
		    });
		});
        it('/ta-YUMJAPVEgI/001/ck.wgt - Test the ability of the user agent to correctly process the text content of a license element.	To pass, the value of the widget license must be the string "PASS".',
		function (done) {
		    testWidget('ta-YUMJAPVEgI/001/ck.wgt', done, function (cfg) {
		        expect(cfg.license.unicode).toEqual("PASS");//Ivan: The function for getting the license element content appears to be broken (fails on all tests).
		    });
		});
        it('/ta-YUMJAPVEgI/002/cl.wgt - Test the ability of the user agent to correctly process the text content of the license element.	To pass, the value of the widget license must be an empty string.',
		function (done) {
		    testWidget('ta-YUMJAPVEgI/002/cl.wgt', done, function (cfg) {
		        expect(cfg.license.unicode).toEqual("");//Ivan: The function for getting the license element content appears to be broken (fails on all tests).
		    });
		});
        it('/ta-YUMJAPVEgI/003/cz.wgt - Test the ability of the user agent to correctly process the text content license element.	To pass, the value of the widget license must a string that corresponds to the following bytes (ASCII): 0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A',
		function (done) {
		    testWidget('ta-YUMJAPVEgI/003/cz.wgt', done, function (cfg) {
		        expect(cfg.license.ASCII).toEqual("\u000A \u0009 \u0050 \u000A \u0009 \u0041 \u000A \u0009 \u0053 \u000A \u0009 \u0053 \u000A");//Ivan: The function for getting the license element content appears to be broken (fails on all tests).
		    });
		});
        it('/ta-YUMJAPVEgI/004/cx.wgt - Test the ability of the user agent to correctly process license element\'s href attribute when it is a file.	To pass, the value of the widget license must be an empty string, but the license href attribute must point to the file at \'test/pass.html\'.',
		function (done) {
		    testWidget('ta-YUMJAPVEgI/004/cx.wgt', done, function (cfg) {
		        expect(cfg.license.unicode).toEqual("");
		        expect(cfg.license.href).toEqual("test/pass.html");//Ivan: Cannot read property, the license element doesn't exists or the widget processor cannot find it.
		    });
		});
    });
    /*
    Test cases for ta-iipTwNshRg
    */
    describe('ta-iipTwNshRg', function () {
        it('/ta-iipTwNshRg/000/d1.wgt - Tests the user agents ability to correctly process icon elements without a src attribute.	To pass, the icons list will only contain icon.png',
		function (done) {
		    testWidget('ta-iipTwNshRg/000/d1.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();//Ivan: cfg.icons is not defined, no processing taking place. Is there a problem with icon processing in general or just its ability to handle icons without src
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual('icon.png')
		    });
		});
        it('/ta-iipTwNshRg/001/ga.wgt - Tests the user agents ability to correctly process icon elements with an empty src attribute.	To pass, the icons list will only contain icon.png',
		function (done) {
		    testWidget('ta-iipTwNshRg/001/ga.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();//Ivan: cfg.icons is not defined, no processing taking place. Is there a problem with icon processing in general or just its ability to handle icons without src
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual('icon.png');
		    });
		});
    });
    /*
    Tests for ta-roCaKRxZhS
    */
    describe('ta-roCaKRxZhS', function () {
        it('/ta-roCaKRxZhS/000/d2.wgt - Tests the UA\'s ability to handle the situation where a path points to an icon which does not exist.	To pass, the icons list must contain icon.png.',
		function (done) {
		    testWidget('ta-roCaKRxZhS/000/d2.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeDefined();
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual('icon.png')
		    });
		});
    });
    /*
    Tests for ta-MFcsScFEaC
    */
    describe('ta-MFcsScFEaC', function () {
        it('/ta-MFcsScFEaC/000/d3.wgt - Test the UA\'s ability to progress to Step 8 when it has nothing to process inside the widget element.	To pass, the widget start file must be "index.htm"',
		function (done) {
		    testWidget('ta-MFcsScFEaC/000/d3.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
    });
    /*
    Tests for ta-ignore-unrequired-feature-with-invalid-name
    */
    describe('ta-ignore-unrequired-feature-with-invalid-name', function () {
        it('/ta-ignore-unrequired-feature-with-invalid-name/000/gg.wgt - Tests the user agents ability to correctly process a feature element.	To pass, the user agent must not contain any values in the feature list (i.e., the erroneously named feature is ignored). ',
		function (done) {
		    testWidget('ta-ignore-unrequired-feature-with-invalid-name/000/gg.wgt', done, function (cfg) {
		        expect(cfg.features).toBeUndefined();//Ivan: Feature list contains error codes when it should be empty. Line 746 widgetconfigprocessor.js
		    });
		});
    });
    /*
    Tests for ta-paWbGHyVrG
    */
    describe('ta-paWbGHyVrG', function () {
        it('/ta-paWbGHyVrG/000/d4.wgt - Tests the user agents ability to correctly process a feature element.	To pass, the user agent must treat this widget as an invalid widget. ',
		function (done) {
		    testWidget('ta-paWbGHyVrG/000/d4.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: Widget is not being invalidated.
		    });
		});
    });
    /* 
    Test cases for ta-luyKMFABLX
    */
    describe('ta-luyKMFABLX', function () {
        it('/ta-luyKMFABLX/000/d5.wgt - Tests the user agents ability to correctly process a feature element.	To pass, the user agent must not contain any values in the feature list (i.e., the unknown feature is skipped). ',
		function (done) {
		    testWidget('ta-luyKMFABLX/000/d5.wgt', done, function (cfg) {
		        expect(cfg.features).toBeUndefined();//Ivan: Feature list contains error codes when it should be empty. Line 746 widgetconfigprocessor.js
		    });
		});
    });
    /*
    Test cases for ta-xlgUWUVzCY
    */
    describe('ta-xlgUWUVzCY', function () {
        it('/ta-xlgUWUVzCY/000/d6.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agent\'s ability to correctly process a param element.	To pass, feature \'feature:a9bb79c1\' must not have any associated parameters.',
		function (done) {
		    testWidget('ta-xlgUWUVzCY/000/d6.wgt', done, function (cfg) {
		        expect(cfg.features).toBeDefined();
		        expect(cfg.features[0].param).toBeUndefined();
		    });
		});
    });
    /*
    Test cases for ta-LTUJGJFCOU
    */
    describe('ta-LTUJGJFCOU', function () {
        it('/ta-LTUJGJFCOU/000/d7.wgt - Test that the user agent skips a content element with no src attribute and	loads default start file. To pass, the start file must be index.htm at the root of the widget.',
		function (done) {
		    testWidget('ta-LTUJGJFCOU/000/d7.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
        it('/ta-LTUJGJFCOU/001/d8.wgt - Test that the user agent skips a content element with no src attribute and	loads default start file.	To pass, the start file must be index.htm at the root of the widget.',
		function (done) {
		    testWidget('ta-LTUJGJFCOU/001/d8.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
        it('/ta-LTUJGJFCOU/002/gb.wgt - Test that the user agent correctly handles a content element with an empty src attribute.	To pass, the start file must be index.htm at the root of the widget.',
		function (done) {
		    testWidget('ta-LTUJGJFCOU/002/gb.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
    });
    /*
    Test cases for ta-LQcjNKBLUZ
    */
    describe('ta-LQcjNKBLUZ', function () {
        it('/ta-LQcjNKBLUZ/000/d9.wgt - Test that the user agent skips a content element that points to a non-existing file and shouldn\'t read the following content element.	To pass the user agent must treat the widget as invalid.',
		function (done) {
		    testWidget('ta-LQcjNKBLUZ/000/d9.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: Is not invalidating widget just placing error code.
		    });
		});
        it('/ta-LQcjNKBLUZ/001/d0.wgt - Test that the user agent skips a content element that points to a non-existing file.	To pass, the start file must be index.htm',
		function (done) {
		    testWidget('ta-LQcjNKBLUZ/001/d0.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.htm");
		    });
		});
    });
    /*
    Test cases for ta-ZjcdAxFMSx
    */
    describe('ta-ZjcdAxFMSx', function () {
        it('/ta-ZjcdAxFMSx/000/dq.wgt - Test the UA\'s ability to correctly find config document.	To pass, the user agent must treat this as an invalid widget (config.exe is not a recognized config file name).',
		function (done) {
		    testWidget('ta-ZjcdAxFMSx/000/dq.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('/ta-ZjcdAxFMSx/001/dw.wgt - Test the UA\'s ability to correctly find config document.	To pass, the user agent must treat this as an invalid widget (CoNfIG.xml is not a recognized config file name)',
		function (done) {
		    testWidget('ta-ZjcdAxFMSx/001/dw.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    /*
    Test cases for ta-paIabGIIMC
    */
    describe('ta-paIabGIIMC', function () {
        it('/ta-paIabGIIMC/000/dc.wgt - Test the UA\'s support for explicitly setting the mime type of a file using the type attribute of the content element.	To pass, the widget start file must be index.php and start file content type must be "text/html"',
		function (done) {
		    testWidget('ta-paIabGIIMC/000/dc.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("index.php");
		        expect(cfg.startFile.contentType).toEqual("text/html");//Ivan: Fixed. Type should be ContentType
		    });
		});
        it('/ta-paIabGIIMC/001/dv.wgt - Test the UA\'s support for explicitly setting the mime type of a file using the type attribute of the content element.	To pass, the user agent must treat this as an invalid widget.',
		function (done) {
		    testWidget('ta-paIabGIIMC/001/dv.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: Widget is not being set to invalid when there is an invalid type.
		    });
		});
    });
    /*
    Test cases for ta-rZdcMBExBX
    */
    describe('ta-rZdcMBExBX', function () {
        it('/ta-rZdcMBExBX/000/df.wgt - Test the UA\'s ability to handle a feature element without a name attribute.	To pass, the feature list must remain empty.',
		function (done) {
		    testWidget('ta-rZdcMBExBX/000/df.wgt', done, function (cfg) {
		        expect(cfg.features).toBeUndefined();
		    });
		});
        it('/ta-rZdcMBExBX/002/ha.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Test the UA\'s ability to handle multiple feature elements with the same value for the name attribute, but with different param elements.	To pass, the feature list must contain two features. Both are named \'feature:a9bb79c1\'. One feature must have a parameter named "test" whose value is "pass1"	The other feature must have a parameter named "test" whose value is "pass2" (the order in which the features appear in the feature list in not relevant).',
		function (done) {
		    testWidget('ta-rZdcMBExBX/002/ha.wgt', done, function (cfg) {
		        expect(cfg.features.length).toEqual(2);
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[1].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params[0].name).toEqual("test");
		        expect(cfg.features[1].params[0].name).toEqual("test");

		        if (cfg.features[0].params[0].value == "pass1") {
		            expect(cfg.features[1].params[0].value).toEqual("pass2");
		        }
		        else if (cfg.features[0].params[0].value == "pass2") {
		            expect(cfg.features[1].params[0].value).toEqual("pass1");
		        } else {
		            expect("todo").toEqual("done");
		        }
		    });
		});

    });
    /*
    Test cases for ta-EGkPfzCBOz
    */
    describe('ta-EGkPfzCBOz', function () {
        it('/ta-EGkPfzCBOz/000/dt.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agents to correctly handle a param element with missing name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with no associated parameters.',
		function (done) {
		    testWidget('ta-EGkPfzCBOz/000/dt.wgt', done, function (cfg) {
		        expect(cfg.features.length).toEqual(1);
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params).toBeUndefined();//Ivan: features doesn't appear to be being defined except for with an error code. 
		    });
		});
        it('/ta-EGkPfzCBOz/001/dg.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.Tests the user agents to correctly handle a param element with missing name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with one associated parameter whose name	is \'PASS\' and whose value is \'PASS\'.',
		function (done) {
		    testWidget('ta-EGkPfzCBOz/001/dg.wgt', done, function (cfg) {
		        expect(cfg.features.length).toEqual(1);
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");//Ivan: This might not be the correct way of accessing features and parameters as all tests of features fail.
		        expect(cfg.features[0].params.length).toEqual(1);
		        expect(cfg.features[0].params[0].name).toEqual('PASS');
		        expect(cfg.features[0].params[0].value).toEqual('PASS')
		    });
		});
        it('/ta-EGkPfzCBOz/002/v9.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.Tests the user agents to correctly handle param elements that have the same value for the name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with two associated parameters whose name	is \'PASS\' and whose value are \'value1\' and \'value2\'.',
		function (done) {
		    testWidget('ta-EGkPfzCBOz/002/v9.wgt', done, function (cfg) {//Ivan: see above
		        expect(cfg.features.length).toEqual(1);
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params.length).toEqual(2);
		        expect(cfg.features[0].params[0].name).toEqual('PASS');
		        expect(cfg.features[0].params[1].name).toEqual('PASS');
		        expect(cfg.features[0].params[0].value).toEqual('value1');
		        expect(cfg.features[0].params[1].value).toEqual('value2');
		    });
		});
    });
    /*
    Test cases for ta-pIffQywZin
    */

    describe('ta-pIffQywZin', function () {
        it('/ta-pIffQywZin/000/db.wgt - Test that the user agent skip a content element that uses an invalid path.	To pass, the start file must be index.htm at the root of the widget package.',
		function (done) {
		    testWidget('ta-pIffQywZin/000/db.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual('index.htm');
		    });
		});
    });

    describe('ta-pIffQywZin', function () {
        it('ta-pIffQywZin/000/db.wgt - Test that the user agent skip a content element that uses an invalid path.	To pass, the start file must be index.htm at the root of the widget package.',
		function (done) {
		    testWidget('ta-pIffQywZin/000/db.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual('index.htm');
		    });
		});
    });
    describe('ta-FDGQBROtzW', function () {
        it('ta-FDGQBROtzW/000/dn.test - [optional test!] Tests the user agent\'s ability to process files with a file extension other than .wgt.	To pass, the user agent start file of the widget must be index.htm',
		function (done) {
		    testWidget('ta-FDGQBROtzW/000/dn.test', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual('index.htm');
		    });
		});
        it('ta-FDGQBROtzW/001/dm - Tests the user agent\'s ability to process files with no file extension.	To pass, the user agent start file of the widget must be index.htm',
		function (done) {
		    testWidget('ta-FDGQBROtzW/001/dm', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual('index.htm');
		    });
		});
    });
    describe('ta-qxLSCRCHlN', function () {
        it('ta-qxLSCRCHlN/000/dk.wgt - [optional] Test the ability to deal with a widget with a wrong magic number.	To pass, the user agent must treat this as an invalid widget.',
		function (done) {
		    testWidget('ta-qxLSCRCHlN/000/dk.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    describe('ta-uLHyIMvLwz', function () {
        it('ta-uLHyIMvLwz/000/dl.wgt - Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is encrypted - password is test).',
		function (done) {
		    testWidget('ta-uLHyIMvLwz/000/dl.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('ta-uLHyIMvLwz/001/split.wgt.001 - Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is spanned).',
		function (done) {
		    testWidget('ta-uLHyIMvLwz/001/split.wgt.001', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
        it('ta-uLHyIMvLwz/002/dp.wgt - Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is empty).',
		function (done) {
		    testWidget('ta-uLHyIMvLwz/002/dp.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();
		    });
		});
    });
    describe('ta-KNiLPOKdgQ', function () {
        it('ta-KNiLPOKdgQ/000/e1.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agents ability to ignore orphan param elements.	To pass, the feature feature:a9bb79c1 must not have any params associated with it.',
		function (done) {
		    testWidget('ta-KNiLPOKdgQ/000/e1.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params.length).toEqual(0);//Ivan: Fixed (params is always defined so need to ensure it has nothing in it.
		    });
		});
    });
    describe('ta-CEGwkNQcWo', function () {
        it('ta-CEGwkNQcWo/000/e2.wgt - Test that a user agent correctly ignores param elements with empty name attributes.	To pass, the feature feature:a9bb79c1 must not have any associated params.',
		function (done) {
		    testWidget('ta-CEGwkNQcWo/000/e2.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params.length).toEqual(0);//Ivan: See above.
		    });
		});
        it('ta-CEGwkNQcWo/001/e3.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Test that a user agent correctly applies the rule for getting a single attribute value to a param element\'s name and value attributes.	To pass, the feature feature:a9bb79c1 must not have any associated params.',
		function (done) {
		    testWidget('ta-CEGwkNQcWo/001/e3.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		        expect(cfg.features[0].params.length).toEqual(0); //Ivan: See above.
		    });
		});
    });
    describe('ta-dPOgiLQKNK', function () {
        it('ta-dPOgiLQKNK/000/e4.wgt - Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it is empty.	To pass, the value of the start file encoding must be UTF-8.',
		function (done) {
		    testWidget('ta-dPOgiLQKNK/000/e4.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("UTF-8");//Ivan: Does not seem to be set correctly in widgetconfigprocessor.js despite declaration on line 667.
		    });
		});
        it('ta-dPOgiLQKNK/001/e5.wgt - This test is optional as user agents are not required to support ISO-8859-1. 	Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it contains the value "ISO-8859-1".	To pass, the value of the start file encoding must be ISO-8859-1.',
		function (done) {
		    testWidget('ta-dPOgiLQKNK/001/e5.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("ISO-8859-1"); //Ivan: see above.
		    });
		});
        it('ta-dPOgiLQKNK/002/e6.wgt - This test is optional as user agents are not required to support ISO-8859-1. 	Test that a user agent correctly applies the rule for getting a single attribute value to the content element\'s encoding attribute.	To pass, the value of the start file encoding must be ISO-8859-1.',
		function (done) {
		    testWidget('ta-dPOgiLQKNK/002/e6.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("ISO-8859-1"); //Ivan: see above.
		    });
		});
        it('ta-dPOgiLQKNK/003/e7.wgt - Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it encounters a bogus encoding name.	To pass, the value of the start file encoding must be UTF-8.',
		function (done) {
		    testWidget('ta-dPOgiLQKNK/003/e7.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("UTF-8");//Ivan: see above.
		    });
		});
    });
    describe('ta-vOBaOcWfll', function () {
        it('ta-vOBaOcWfll/000/e8.wgt - Tests the ability of the user agent to correctly handle required a feature when the feature is not supported by the UA.	To pass, the UA must treat this as an invalid widget.',
		function (done) {
		    testWidget('ta-vOBaOcWfll/000/e8.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: Widget is not being invalidated, need code to mark widget invalid.
		    });
		});
    });
    describe('ta-bbbbbbbbbb', function () {
        it('ta-bbbbbbbbbb/000/xx.wgt - Tests the ability of the user agent to correctly ignore unknown elements.	To pass, the UA must use pass.html as the start file.',
		function (done) {
		    testWidget('ta-bbbbbbbbbb/000/xx.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.html");
		    });
		});
    });
    describe('ta-iuJHnskSHq', function () {
        it('ta-iuJHnskSHq/000/zz.wgt - Tests the ability of the user agent to correctly deal with an icon element	that points to a file that is not present in the widget package.	To pass, the icon list must be empty.',
		function (done) {
		    testWidget('ta-iuJHnskSHq/000/zz.wgt', done, function (cfg) {
		        expect(cfg.icons).toBeUndefined();
		    });
		});
        it('ta-iuJHnskSHq/001/za.wgt - Test the UAs ability to ignore un-processable files as an icon format (fail contains garbage data).	To pass, the user agent must behave as if "pass.png" is the only icon in the icons	list.',
		function (done) {
		    testWidget('ta-iuJHnskSHq/001/za.wgt', done, function (cfg) {
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons).toContain("pass.png");//Ivan: Pass.png is not present in icons, is it being set correctly or are we looking at the wrong part of icons, e.g. name
		    });
		});
        it('ta-iuJHnskSHq/003/zc.wgt - Test the UAs ability to ignore subsequent declarations to use the same icon.	To pass, the user agent must contain "locales/en/custom.png"  	(or "custom.png" depending on the default locale of the user agent) in the icons list and the icon must not have an associated width or height (unless it has been computed from the file).',
		function (done) {
		    testWidget('ta-iuJHnskSHq/003/zc.wgt', done, function (cfg) {
		        expect(cfg.icons.length).toBeGreaterThan(0);
		        expect(cfg.icons[0].path).toEqual("locales/en/custom.png");
		        expect(cfg.icons[0].height).toEqual(0);
		        expect(cfg.icons[0].width).toEqual(0);//Ivan: Is not checking for height and width being -1 properly or there is a default of -1.
		    });
		});
    });
    describe('ta-eHUaPbgfKg', function () {
        it('ta-eHUaPbgfKg/000/ix.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the value "123".',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/000/ix.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(123);
		    });
		});
        it('ta-eHUaPbgfKg/001/iy.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the user agent must ignore the value of the icon\'s height attribute (the value is composed of characters).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/001/iy.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(0);
		    });
		});
        it('ta-eHUaPbgfKg/002/iz.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the numeric value 100 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/002/iz.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(100);
		    });
		});
        it('ta-eHUaPbgfKg/003/i1.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the numeric value 123 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/003/i1.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(123);
		    });
		});
        it('ta-eHUaPbgfKg/004/i2.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be ignored (the value is an empty string, hence it would be ignored).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/004/i2.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(0);//Ivan: See above
		    });
		});
        it('ta-eHUaPbgfKg/005/i3.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/005/i3.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(0);//Ivan: see above
		    });
		});
        it('ta-eHUaPbgfKg/006/i4.wgt - Test the UA\'s ability process the height attribute of an icon.	To pass, the value of the height attribute must be ignored (it is less than zero).',
		function (done) {
		    testWidget('ta-eHUaPbgfKg/006/i4.wgt', done, function (cfg) {
		        expect(cfg.icons[0].height).toEqual(0);
		    });
		});
    });
    describe('ta-nYAcofihvj', function () {
        it('ta-nYAcofihvj/000/iq.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the value "123".',
		function (done) {
		    testWidget('ta-nYAcofihvj/000/iq.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(123);
		    });
		});
        it('ta-nYAcofihvj/001/i9.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is composed of characters).',
		function (done) {
		    testWidget('ta-nYAcofihvj/001/i9.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(0);
		    });
		});
        it('ta-nYAcofihvj/002/iw.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the numeric value 100 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-nYAcofihvj/002/iw.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(100);
		    });
		});
        it('ta-nYAcofihvj/003/ie.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the numeric value 123 (resulting from rule for parsing a non-negative integer).',
		function (done) {
		    testWidget('ta-nYAcofihvj/003/ie.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(123);
		    });
		});
        it('ta-nYAcofihvj/004/ir.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is an empty string, hence it would be ignored).',
		function (done) {
		    testWidget('ta-nYAcofihvj/004/ir.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(0);//Ivan: See above
		    });
		});
        it('ta-nYAcofihvj/005/it.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
		    testWidget('ta-nYAcofihvj/005/it.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(0);//Ivan: See above
		    });
		});
        it('ta-nYAcofihvj/006/ib.wgt - Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored.',
		function (done) {
		    testWidget('ta-nYAcofihvj/006/ib.wgt', done, function (cfg) {
		        expect(cfg.icons[0].width).toEqual(0);
		    });
		});
    });
    describe('ta-aaaaaaaaaa', function () {
        it('ta-aaaaaaaaaa/000/z1.wgt - This test is optional as user agents are not required to support ISO-8859-1. 	Test that the user agent correctly handles a charset parameter when the type attribute is present.	To pass, the user agent must sets the start file encoding to \'ISO-8859-1\' and ignore the charset parameter used in the type attribute.',
		function (done) {
		    testWidget('ta-aaaaaaaaaa/000/z1.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("iso-8859-1");//Ivan: Failing on this, doesn't seem to like this encoding (does webinos support this standard?).
		    });
		});
        it('ta-aaaaaaaaaa/001/z2.wgt - This test is optional as user agents are not required to support Windows-1252. 	Test that the user agent sets the user agent can derive the start file encoding from the charset parameter in the type attribute.	To pass, the start file encoding must be \'Windows-1252\'.',
		function (done) {
		    testWidget('ta-aaaaaaaaaa/001/z2.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("Windows-1252");
			
		    });
		});
    });
    describe('ta-GVVIvsdEUo', function () {
        it('ta-GVVIvsdEUo/000/z3 - Test the user agent\'s ability to get a widget over HTTP and respect the application/widget mimetype. The server from which this test is served from has been set up to label the \'test\' resource as an \'application/widget\'.	To pass, a user agent must correctly process this resource as a widget because of the \'application/widget\' mimetype (i.e., not only because of sniffing).',
		function (done) {
		    testWidget('ta-GVVIvsdEUo/000/z3', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");//Ivan: Test is not finished.
		    });
		});
        it('ta-GVVIvsdEUo/001/z4.html - Test the user agent\'s ability to get a widget over HTTP and respect the \'application/widget\' mimetype. The server from which this test is served from has been set up to label the \'test.html\' resource as an \'application/widget\'.	To pass, a user agent must correctly process this resource as a widget because of the \'application/widget\' mimetype (i.e., not only via sniffing).',
		function (done) {
		    testWidget('ta-GVVIvsdEUo/001/z4.html', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");//Ivan: Test is not finished.
		    });
		});
        it('ta-GVVIvsdEUo/002/z5.wgt - Test the user agent\'s ability handle a widget served with a bogus mime type. The server from which this test is served from has been set up to label the \'a5.wgt\' resource as an \'x-xDvaDFadAF/x-adfsdADfda\'. To pass, a user agent must must treat the resource as invalid  (the mime type is bogus).',
		function (done) {
		    testWidget('ta-GVVIvsdEUo/002/z5.wgt', done, function (cfg) {
		        expect(cfg).toBeUndefined();//Ivan: How to check for resource validity as oppose to widget validity?
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-windowModes', function () {
        it('ta-windowModes/001/viewb.wgt - Test the UA\'s ability process the various values applicable to windowModes attribute of the widget element. To pass, the windowModes list should contain a single value "floating" and/or "maximized" if the UA supports this else empty.',
		function (done) {
		    testWidget('ta-windowModes/001/viewb.wgt', done, function (cfg) {
		        if (cfg.windowModes.length == 1) {
		            expect("floating" in cfg.windowModes || "maximized" in cfg.windowModes).toBeTruthy();//Ivan: Error: Widget resource file does not exist has no method 'getStatusText'
		        }
		        else {
		            expect(cfg.windowModes.length).toEqual(0);
		        }
		    });
		});
        it('ta-windowModes/005/viewf.wgt - Test the UA\'s ability process a windowModes attribute containing an unsupported value.	To pass, the windowModes list should be empty.',
		function (done) {
		    testWidget('ta-windowModes/005/viewf.wgt', done, function (cfg) {
		        expect(cfg.windowModes.length).toEqual(0);//Ivan: See above (windowModes is not supported?)
		    });
		});
        it('ta-windowModes/006/viewg.wgt - Test the UA\'s ability process a windowModes attribute containing multiple supported values.	To pass, the windowModes list should be "windowed floating maximized" if the UA supports all of these.',
		function (done) {
		    testWidget('ta-windowModes/006/viewg.wgt', done, function (cfg) {
		        expect(cfg.windowModes[0]).toEqual("windowed"); //TODO -- How to check if the UA supports all of these modes, if it doesn't then 
		        expect(cfg.windowModes[1]).toEqual("floating"); // not all of them will appear. Also should the length of windowModes be checked?
		        expect(cfg.windowModes[2]).toEqual("maximized");//Ivan: See above (windowModes is not supported?)
		    });
		});
        it('ta-windowModes/007/viewh.wgt - Test the UA\'s ability process a windowModes attribute containing supported and unsupported values.	To pass, the windowModes list should be "floating windowed maximized" if the UA supports all of these.',
		function (done) {
		    testWidget('ta-windowModes/007/viewh.wgt', done, function (cfg) {
		        expect(cfg.windowModes[0]).toEqual("floating"); //TODO -- How to check if the UA supports all of these modes, if it doesn't then 
		        expect(cfg.windowModes[1]).toEqual("windowed"); // not all of them will appear. Also should the length of windowModes be checked?
		        expect(cfg.windowModes[2]).toEqual("maximized");//Ivan: See above (windowModes is not supported?)
		    });
		});
        it('ta-windowModes/008/viewi.wgt - Test the UA\'s ability process an empty windowModes attribute of the widget element.	To pass, the windowModes list should be empty.',
		function (done) {
		    testWidget('ta-windowModes/008/viewi.wgt', done, function (cfg) {
		        expect(cfg.windowModes.length).toEqual(0);//Ivan: See above (windowModes is not supported?)
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-lro/001/i18nlro01.wgt - Tests that LRO direction applies to the name element.	To pass, the displayed value of the name element must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/001/i18nlro01.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-lro/002/i18nlro02.wgt - Tests that LRO direction applies to the name element\'s short attribute.	To pass, the displayed value of the short attribute must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/002/i18nlro02.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-lro/003/i18nlro03.wgt - Tests that LRO direction applies to the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/003/i18nlro03.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-lro/004/i18nlro04.wgt - Tests that LRO direction applies to the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/004/i18nlro04.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-lro/005/i18nlro05.wgt - Tests that LRO direction applies to the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/005/i18nlro05.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-lro/006/i18nlro06.wgt - Tests that LRO direction applies to the span element within the name element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/006/i18nlro06.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-lro/007/i18nlro07.wgt - Tests that LRO direction applies to the span element within the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/007/i18nlro07.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-lro/008/i18nlro08.wgt - Tests that LRO direction applies to the span element within the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/008/i18nlro08.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-lro/009/i18nlro09.wgt - Tests that LRO direction applies to the span element within the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/009/i18nlro09.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-lro/010/i18nlro10.wgt - Tests that nested LRO and RLO directions applies within the name element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/010/i18nlro10.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-lro/011/i18nlro11.wgt - Tests that nested LRO and RLO directions applies within the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/011/i18nlro11.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-lro/012/i18nlro12.wgt - Tests that nested LRO and RLO directions applies within the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/012/i18nlro12.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-lro/013/i18nlro13.wgt - Tests that nested LRO and RLO directions applies within the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/013/i18nlro13.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-lro/014/i18nlro14.wgt - Tests that LRO direction is inherited by the name element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/014/i18nlro14.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-lro/015/i18nlro15.wgt - Tests that LRO direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/015/i18nlro15.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-lro/016/i18nlro16.wgt - Tests that LRO direction is inherited by the description element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/016/i18nlro16.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-lro/017/i18nlro17.wgt - Tests that LRO direction is inherited by the author element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/017/i18nlro17.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-lro/018/i18nlro18.wgt - Tests that LRO direction is inherited by the license element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/018/i18nlro18.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-lro/019/i18nlro19.wgt - Tests that nested LRO and LTR directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-lro/019/i18nlro19.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-lro/020/i18nlro20.wgt - Tests that nested LRO and RTL directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-lro/020/i18nlro20.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-lro/021/i18nlro21.wgt - Tests that nested LRO and LRO directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-lro/021/i18nlro21.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-lro/022/i18nlro22.wgt - Tests that nested LRO and RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-lro/022/i18nlro22.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-roCaKRxZhS', function () {
        it('i18n-lro/023/i18nlro23.wgt - Tests that LRO direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
		    testWidget('i18n-lro/023/i18nlro23.wgt', done, function (cfg) {
		        expect(cfg.icons[0].path).toEqual("test.png")
		    });
		});
    });
    describe('ta-LQcjNKBLUZ', function () {
        it('i18n-lro/026/i18nlro26.wgt - Tests that LRO direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
		    testWidget('i18n-lro/026/i18nlro26.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.htm");
		    });
		});
    });
    describe('ta-paIabGIIMC', function () {
        it('i18n-lro/027/i18nlro27.wgt - Tests that LRO direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-lro/027/i18nlro27.wgt', done, function (cfg) {
		        expect(cfg.content.type).toEqual("text/html");
		    });
		});
    });
    describe('ta-dPOgiLQKNK', function () {
        it('i18n-lro/028/i18nlro28.wgt - Tests that LRO direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-lro/028/i18nlro28.wgt', done, function (cfg) {
		        expect(cfg.content.encoding).toEqual("iso-8859-1");
		    });
		});
    });
    describe('ta-rZdcMBExBX', function () {
        it('i18n-lro/029/i18nlro29.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that LRO direction does not apply to the feature element\'s name attribute.	To pass, the value of the attribute must remain "feature:a9bb79c1".',
		function (done) {
		    testWidget('i18n-lro/029/i18nlro29.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		    });
		});
        it('i18n-lro/030/i18nlro30.wgt - Tests that LRO direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
		    testWidget('i18n-lro/030/i18nlro30.wgt', done, function (cfg) {
		        expect(cfg.features[0].required).toBeFalsy();
		    });
		});
    });
    describe('ta-CEGwkNQcWo', function () {
        it('i18n-lro/031/i18nlro31.wgt - Tests that LRO direction does not apply to the param element\'s name attribute.	To pass, the value of the param element\'s name attribute must remain "??????".',
		function (done) {
		    testWidget('i18n-lro/031/i18nlro31.wgt', done, function (cfg) {
		        expect(cfg.features[0].params[0].name).toEqual("??????");
		    });
		});
        it('i18n-lro/032/i18nlro32.wgt - Tests that LRO direction does not apply to the param element\'s value attribute.	To pass, the param element\'s name attribute must remain "??????".',
		function (done) {
		    testWidget('i18n-lro/032/i18nlro32.wgt', done, function (cfg) {
		        expect(cfg.features[0].params[0].name).toEqual("??????");
		    });
		});
    });
    describe('ta-DwhJBIJRQN', function () {
        it('i18n-lro/033/i18nlro33.wgt - Tests that LRO direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/033/i18nlro33.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].value).toEqual("??????");
		    });
		});
        it('i18n-lro/034/i18nlro34.wgt - Tests that LRO direction does not apply to the preference element\'s value attribute.	To pass, the value must be "??????".',
		function (done) {
		    testWidget('i18n-lro/034/i18nlro34.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].value).toEqual("??????")
		    });
		});
        it('i18n-lro/035/i18nlro35.wgt - Tests that LRO direction does not apply to the preference element\'s readonly attribute.	To pass, the value must be "true".',
		function (done) {
		    testWidget('i18n-lro/035/i18nlro35.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].readonly).toBeTruthy();
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-lro/036/i18nlro36.wgt - Tests that LRO direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-lro/036/i18nlro36.wgt', done, function (cfg) {
		        expect(cfg.author.href).toEqual("http://widget.example.org/");
		    });
		});
        it('i18n-lro/037/i18nlro37.wgt - Tests that LRO direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/037/i18nlro37.wgt', done, function (cfg) {
		        expect(cfg.author.email).toEqual("??????");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-lro/038/i18nlro38.wgt - Tests that LRO direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-lro/038/i18nlro38.wgt', done, function (cfg) {
		        expect(cfg.license.href).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-UScJfQHPPy', function () {
        it('i18n-lro/039/i18nlro39.wgt - Tests that LRO direction does not apply to the widget element\'s width attribute.	To pass, the widget element\'s width attribute must be "123" or a value greater than 0',
		function (done) {
		    testWidget('i18n-lro/039/i18nlro39.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-BxjoiWHaMr', function () {
        it('i18n-lro/040/i18nlro40.wgt - Tests that LRO direction does not apply to the widget element\'s height attribute.	To pass, the widget element\'s height attribute must be "123" or a value greater than 0',
		function (done) {
		    testWidget('i18n-lro/040/i18nlro40.wgt', done, function (cfg) {
		        expect(cfg.height).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-RawAIWHoMs', function () {
        it('i18n-lro/041/i18nlro41.wgt - Tests that LRO direction does not apply to the widget element\'s id attribute.	To pass, the id attribute must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-lro/041/i18nlro41.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-windowModes', function () {
        it('i18n-lro/043/i18nlro43.wgt - Tests that LRO direction does not apply to the widget element\'s windowModes attribute.	To pass, the widget needs to be put into one of the following view modes (if supported) "maximized floating".',
		function (done) {
		    testWidget('i18n-lro/043/i18nlro43.wgt', done, function (cfg) {
		        expect(cfg.windowModes[0] == "maximized" || cfg.windowsModes[0] == "floating").toBeTruthy();
		    });
		});
    });
    describe('ta-klLDaEgJeU', function () {
        it('i18n-lro/044/i18nlro44.wgt - Tests that LRO direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
		    testWidget('i18n-lro/044/i18nlro44.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-ltr/001/i18nltr01.wgt - Tests that LTR direction applies to the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/001/i18nltr01.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/002/i18nltr02.wgt - Tests that LTR direction applies to the name element\'s short attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/002/i18nltr02.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-ltr/003/i18nltr03.wgt - Tests that LTR direction applies to the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/003/i18nltr03.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-ltr/004/i18nltr04.wgt - Tests that LTR direction applies to the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/004/i18nltr04.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-ltr/005/i18nltr05.wgt - Tests that LTR direction applies to the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/005/i18nltr05.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-ltr/006/i18nltr06.wgt - Tests that LTR direction applies to the span element within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/006/i18nltr06.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-ltr/007/i18nltr07.wgt - Tests that LTR direction applies to the span element within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/007/i18nltr07.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-ltr/008/i18nltr08.wgt - Tests that LTR direction applies to the span element within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/008/i18nltr08.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-ltr/009/i18nltr09.wgt - Tests that LTR direction applies to the span element within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/009/i18nltr09.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-ltr/010/i18nltr10.wgt - Tests that nested LTR and RTL directions applies within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/010/i18nltr10.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-ltr/011/i18nltr11.wgt - Tests that nested LTR and RTL directions applies within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/011/i18nltr11.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-ltr/012/i18nltr12.wgt - Tests that nested LTR and RTL directions applies within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/012/i18nltr12.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-ltr/013/i18nltr13.wgt - Tests that nested LTR and RTL directions applies within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/013/i18nltr13.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-ltr/014/i18nltr14.wgt - Tests that LTR direction is inherited by the name element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/014/i18nltr14.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/015/i18nltr15.wgt - Tests that LTR direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/015/i18nltr15.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-ltr/016/i18nltr16.wgt - Tests that LTR direction is inherited by the description element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/016/i18nltr16.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-ltr/017/i18nltr17.wgt - Tests that LTR direction is inherited by the author element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/017/i18nltr17.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-ltr/018/i18nltr18.wgt - Tests that LTR direction is inherited by the license element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/018/i18nltr18.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-ltr/019/i18nltr19.wgt - Tests that nested LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-ltr/019/i18nltr19.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/020/i18nltr20.wgt - Tests that nested LTR and RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-ltr/020/i18nltr20.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/021/i18nltr21.wgt - Tests that nested LTR and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-ltr/021/i18nltr21.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/022/i18nltr22.wgt - Tests that nested LTR and RLO directions apply correctly.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-ltr/022/i18nltr22.wgt', done, function (cfg) {
		        expect(cfg).toBeDefined();
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-roCaKRxZhS', function () {
        it('i18n-ltr/023/i18nltr23.wgt - Tests that LTR direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
		    testWidget('i18n-ltr/023/i18nltr23.wgt', done, function (cfg) {
		        expect(cfg.icons[0].path).toEqual("test.png");
		    });
		});
    });
    describe('ta-LQcjNKBLUZ', function () {
        it('i18n-ltr/026/i18nltr26.wgt - Tests that LTR direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
		    testWidget('i18n-ltr/026/i18nltr26.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.htm");
		    });
		});
    });
    describe('ta-paIabGIIMC', function () {
        it('i18n-ltr/027/i18nltr27.wgt - Tests that LTR direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-ltr/027/i18nltr27.wgt', done, function (cfg) {
		        expect(cfg.startFile.contentType).toEqual("text/html");
		    });
		});
    });
    describe('ta-dPOgiLQKNK', function () {
        it('i18n-ltr/028/i18nltr28.wgt - Tests that LTR direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-ltr/028/i18nltr28.wgt', done, function (cfg) {
		        expect(cfg.startFile.encoding).toEqual("iso-8859-1");
		    });
		});
    });
    describe('ta-rZdcMBExBX', function () {
        it('i18n-ltr/029/i18nltr29.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that LTR direction does not apply to the feature element\'s name attribute.	To pass, the displayed value must be treated as "feature:a9bb79c1".',
		function (done) {
		    testWidget('i18n-ltr/029/i18nltr29.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature.a9bb79c1");
		    });
		});
        it('i18n-ltr/030/i18nltr30.wgt - Tests that LTR direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
		    testWidget('i18n-ltr/030/i18nltr30.wgt', done, function (cfg) {
		        expect(cfg.features[0].required).toBeFalsy();
		    });
		});
    });
    describe('ta-CEGwkNQcWo', function () {
        it('i18n-ltr/031/i18nltr31.wgt - Tests that LTR direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/031/i18nltr31.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/032/i18nltr32.wgt - Tests that LTR direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/032/i18nltr32.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-DwhJBIJRQN', function () {
        it('i18n-ltr/033/i18nltr33.wgt - Tests that LTR direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/033/i18nltr33.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/034/i18nltr34.wgt - Tests that LTR direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/034/i18nltr34.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-ltr/035/i18nltr35.wgt - Tests that LTR direction does not apply to the preference element\'s readonly attribute.	To pass, the value must treated as "true".',
		function (done) {
		    testWidget('i18n-ltr/035/i18nltr35.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].readonly).toBeTruthy();
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-ltr/036/i18nltr36.wgt - Tests that LTR direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-ltr/036/i18nltr36.wgt', done, function (cfg) {
		        expect(cfg.author.href).toEqual("http://widget.example.org/");
		    });
		});
        it('i18n-ltr/037/i18nltr37.wgt - Tests that LTR direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/037/i18nltr37.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-ltr/038/i18nltr38.wgt - Tests that LTR direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-ltr/038/i18nltr38.wgt', done, function (cfg) {
		        expect(cfg.license.href).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-UScJfQHPPy', function () {
        it('i18n-ltr/039/i18nltr39.wgt - Tests that LTR direction does not apply to the widget element\'s width attribute.	To pass, the width of the widget value must be "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-ltr/039/i18nltr39.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0)
		    });
		});
    });
    describe('ta-BxjoiWHaMr', function () {
        it('i18n-ltr/040/i18nltr40.wgt - Tests that LTR direction does not apply to the widget element\'s height attribute.	To pass, the height of the widget must be "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-ltr/040/i18nltr40.wgt', done, function (cfg) {
		        expect(cfg.height).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-RawAIWHoMs', function () {
        it('i18n-ltr/041/i18nltr41.wgt - Tests that LTR direction does not apply to the widget element\'s id attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-ltr/041/i18nltr41.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-windowModes', function () {
        it('i18n-ltr/043/i18nltr43.wgt - Tests that LTR direction does not apply to the widget element\'s windowModes attribute.	To pass, the use agent must start in one of the following view modes (if supported) "windowed floating maximized".',
		function (done) {
		    testWidget('i18n-ltr/043/i18nltr43.wgt', done, function (cfg) {
		        expect(wm.ManagerUtils.containsValue(cfg.windowModes, "windowed") || wm.ManagerUtils.containsValue(cfg.windowModes, "floating") || wm.ManagerUtils.containsValue(cfg.windowModes, "maximized")).toBeTruthy();
		    });
		});
    });
    describe('ta-klLDaEgJeU', function () {
        it('i18n-ltr/044/i18nltr44.wgt - Tests that LTR direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
		    testWidget('i18n-ltr/044/i18nltr44.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rlo/001/i18nrlo01.wgt - Tests that RLO direction applies to the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/001/i18nrlo01.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("PASSED");
		    });
		});
        it('i18n-rlo/002/i18nrlo02.wgt - Tests that RLO direction applies to the name element\'s short attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/002/i18nrlo02.wgt', done, function (cfg) {
		        expect(cfg.shortName.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rlo/003/i18nrlo03.wgt - Tests that RLO direction applies to the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/003/i18nrlo03.wgt', done, function (cfg) {
		        expect(cfg.description.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rlo/004/i18nrlo04.wgt - Tests that RLO direction applies to the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/004/i18nrlo04.wgt', done, function (cfg) {
		        expect(cfg.author.name).toEqual("PASSED");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rlo/005/i18nrlo05.wgt - Tests that RLO direction applies to the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/005/i18nrlo05.wgt', done, function (cfg) {
		        expect(cfg.license.text.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rlo/006/i18nrlo06.wgt - Tests that RLO direction applies to the span element within the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/006/i18nrlo06.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rlo/007/i18nrlo07.wgt - Tests that RLO direction applies to the span element within the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/007/i18nrlo07.wgt', done, function (cfg) {
		        expect(cfg.description.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rlo/008/i18nrlo08.wgt - Tests that RLO direction applies to the span element within the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/008/i18nrlo08.wgt', done, function (cfg) {
		        expect(cfg.author.name.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rlo/009/i18nrlo09.wgt - Tests that RLO direction applies to the span element within the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/009/i18nrlo09.wgt', done, function (cfg) {
		        expect(cfg.license.text.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rlo/010/i18nrlo10.wgt - Tests that nested RLO and LRO directions applies within the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/010/i18nrlo10.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rlo/011/i18nrlo11.wgt - Tests that nested RLO and LRO directions applies within the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/011/i18nrlo11.wgt', done, function (cfg) {
		        expect(cfg.description.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rlo/012/i18nrlo12.wgt - Tests that nested RLO and LRO directions applies within the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/012/i18nrlo12.wgt', done, function (cfg) {
		        expect(cfg.author.name.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rlo/013/i18nrlo13.wgt - Tests that nested RLO and LRO directions applies within the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/013/i18nrlo13.wgt', done, function (cfg) {
		        expect(cfg.license.text.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rlo/014/i18nrlo14.wgt - Tests that RLO direction is inherited by the name element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/014/i18nrlo14.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("PASSED");
		    });
		});
        it('i18n-rlo/015/i18nrlo15.wgt - Tests that RLO direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/015/i18nrlo15.wgt', done, function (cfg) {
		        expect(cfg.shortName.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rlo/016/i18nrlo16.wgt - Tests that RLO direction is inherited by the description element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/016/i18nrlo16.wgt', done, function (cfg) {
		        expect(cfg.description.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rlo/017/i18nrlo17.wgt - Tests that RLO direction is inherited by the author element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/017/i18nrlo17.wgt', done, function (cfg) {
		        expect(cfg.author.name.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rlo/018/i18nrlo18.wgt - Tests that RLO direction is inherited by the license element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/018/i18nrlo18.wgt', done, function (cfg) {
		        expect(cfg.license.text.visual).toEqual("PASSED");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rlo/019/i18nrlo19.wgt - Tests that nested RLO and LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rlo/019/i18nrlo19.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rlo/020/i18nrlo20.wgt - Tests that nested RLO and RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rlo/020/i18nrlo20.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rlo/021/i18nrlo21.wgt - Tests that nested RLO and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rlo/021/i18nrlo21.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rlo/022/i18nrlo22.wgt - Tests that nested RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rlo/022/i18nrlo22.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
    });
    describe('ta-roCaKRxZhS', function () {
        it('i18n-rlo/023/i18nrlo23.wgt - Tests that RLO direction does not apply to the icon element\'s src attribute.	To pass, the icon must be "test.png".',
		function (done) {
		    testWidget('i18n-rlo/023/i18nrlo23.wgt', done, function (cfg) {
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual("test.png")
		    });
		});
    });
    describe('ta-LQcjNKBLUZ', function () {
        it('i18n-rlo/026/i18nrlo26.wgt - Tests that RLO direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
		    testWidget('i18n-rlo/026/i18nrlo26.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.htm");
		    }, done);
		});
    });
    describe('ta-paIabGIIMC', function () {
        it('i18n-rlo/027/i18nrlo27.wgt - Tests that RLO direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-rlo/027/i18nrlo27.wgt', done, function (cfg) {
		        expect(cfg.content.type).toEqual("text/html");
		    });
		});
    });
    describe('ta-dPOgiLQKNK', function () {
        it('i18n-rlo/028/i18nrlo28.wgt - Tests that RLO direction does not apply to the content element\'s encoding attribute.	To pass, the displayed value must remain as "ISO-8859-1".',
		function (done) {
		    testWidget('i18n-rlo/028/i18nrlo28.wgt', done, function (cfg) {
		        expect(cfg.content.encoding).toEqual("ISO-8859-1");
		    });
		});
    });
    describe('ta-rZdcMBExBX', function () {
        it('i18n-rlo/029/i18nrlo29.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RLO direction does not apply to the feature element\'s name attribute.	To pass, the user agent needs to treat the feature "feature:a9bb79c1" as supported.',
		function (done) {
		    testWidget('i18n-rlo/029/i18nrlo29.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		    });
		});
        it('i18n-rlo/030/i18nrlo30.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RLO direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
		    testWidget('i18n-rlo/030/i18nrlo30.wgt', done, function (cfg) {
		        expect(cfg.features[0].required).toBeFalsy();
		    });
		});
    });
    describe('ta-CEGwkNQcWo', function () {
        it('i18n-rlo/031/i18nrlo31.wgt - Tests that RLO direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/031/i18nrlo31.wgt', done, function (cfg) {
		        expect(cfg.features[0].params[0].name).toEqual("PASSED");
		    });
		});
        it('i18n-rlo/032/i18nrlo32.wgt - Tests that RLO direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/032/i18nrlo32.wgt', done, function (cfg) {
		        expect(cfg.features[0].params[0].value).toEqual("PASSED");
		    });
		});
    });
    describe('ta-DwhJBIJRQN', function () {
        it('i18n-rlo/033/i18nrlo33.wgt - Tests that RLO direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/033/i18nrlo33.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].name).toEqual("PASSED");
		    });
		});
        it('i18n-rlo/034/i18nrlo34.wgt - Tests that RLO direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/034/i18nrlo34.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].value).toEqual("PASSED");
		    });
		});
        it('i18n-rlo/035/i18nrlo35.wgt - Tests that RLO direction does not apply to the preference element\'s readonly attribute.	To pass, the value must be treated as "true".',
		function (done) {
		    testWidget('i18n-rlo/035/i18nrlo35.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].readonly).toBeTruthy();
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rlo/036/i18nrlo36.wgt - Tests that RLO direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rlo/036/i18nrlo36.wgt', done, function (cfg) {
		        expect(cfg.author.href).toEqual("http://widget.example.org/");
		    });
		});
        it('i18n-rlo/037/i18nrlo37.wgt - Tests that RLO direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/037/i18nrlo37.wgt', done, function (cfg) {
		        expect(cfg.author.email).toEqual("PASSED");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rlo/038/i18nrlo38.wgt - Tests that RLO direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rlo/038/i18nrlo38.wgt', done, function (cfg) {
		        expect(cfg.license.href).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-UScJfQHPPy', function () {
        it('i18n-rlo/039/i18nrlo39.wgt - Tests that RLO direction does not apply to the widget element\'s width attribute.	To pass, the width of the widget must be "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-rlo/039/i18nrlo39.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-BxjoiWHaMr', function () {
        it('i18n-rlo/040/i18nrlo40.wgt - Tests that RLO direction does not apply to the widget element\'s height attribute.	To pass, the height of the widget must be "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-rlo/040/i18nrlo40.wgt', done, function (cfg) {
		        expect(cfg.height).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-RawAIWHoMs', function () {
        it('i18n-rlo/041/i18nrlo41.wgt - Tests that RLO direction does not apply to the widget element\'s id attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rlo/041/i18nrlo41.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-windowModes', function () {
        it('i18n-rtl/043/i18nrtl43.wgt - Tests that RTL direction does not apply to the widget element\'s windowModes attribute.	To pass, windowModes must be one of "maximized, floating, windowed" (if supported).',
		function (done) {
		    testWidget('i18n-rtl/043/i18nrtl43.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-klLDaEgJeU', function () {
        it('i18n-rtl/044/i18nrtl44.wgt - Tests that RTL direction does not apply to the widget element\'s xml:lang attribute.	To pass, the widget element\'s xml:lang attribute must remain as "en".',
		function (done) {
		    testWidget('i18n-rtl/044/i18nrtl44.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-windowModes', function () {
        it('i18n-rlo/043/i18nrlo43.wgt - Tests that RLO direction does not apply to the widget element\'s windowModes attribute.	To pass, the widget needs to be in one of the following view modes (if supported) "windowed floating maximized".',
		function (done) {
		    testWidget('i18n-rlo/043/i18nrlo43.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-klLDaEgJeU', function () {
        it('i18n-rlo/044/i18nrlo44.wgt - Tests that RLO direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
		    testWidget('i18n-rlo/044/i18nrlo44.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rtl/001/i18nrtl01.wgt - Tests that RTL direction applies to the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/001/i18nrtl01.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rtl/002/i18nrtl02.wgt - Tests that RTL direction applies to the name element\'s short attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/002/i18nrtl02.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rtl/003/i18nrtl03.wgt - Tests that RTL direction applies to the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/003/i18nrtl03.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rtl/004/i18nrtl04.wgt - Tests that RTL direction applies to the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/004/i18nrtl04.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rtl/005/i18nrtl05.wgt - Tests that RTL direction applies to the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/005/i18nrtl05.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rtl/006/i18nrtl06.wgt - Tests that RTL direction applies to the span element within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/006/i18nrtl06.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rtl/007/i18nrtl07.wgt - Tests that RTL direction applies to the span element within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/007/i18nrtl07.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rtl/008/i18nrtl08.wgt - Tests that RTL direction applies to the span element within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/008/i18nrtl08.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rtl/009/i18nrtl09.wgt - Tests that RTL direction applies to the span element within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/009/i18nrtl09.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rtl/010/i18nrtl10.wgt - Tests that nested RTL and RTL directions applies within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/010/i18nrtl10.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rtl/011/i18nrtl11.wgt - Tests that nested RTL and RTL directions applies within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/011/i18nrtl11.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rtl/012/i18nrtl12.wgt - Tests that nested RTL and RTL directions applies within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/012/i18nrtl12.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rtl/013/i18nrtl13.wgt - Tests that nested RTL and RTL directions applies within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/013/i18nrtl13.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rtl/014/i18nrtl14.wgt - Tests that RTL direction is inherited by the name element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/014/i18nrtl14.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rtl/015/i18nrtl15.wgt - Tests that RTL direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/015/i18nrtl15.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-VdCEyDVSA', function () {
        it('i18n-rtl/016/i18nrtl16.wgt - Tests that RTL direction is inherited by the description element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/016/i18nrtl16.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rtl/017/i18nrtl17.wgt - Tests that RTL direction is inherited by the author element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/017/i18nrtl17.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rtl/018/i18nrtl18.wgt - Tests that RTL direction is inherited by the license element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/018/i18nrtl18.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-AYLMhryBnD', function () {
        it('i18n-rtl/019/i18nrtl19.wgt - Tests that nested RTL and LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rtl/019/i18nrtl19.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rtl/020/i18nrtl20.wgt - Tests that nested RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rtl/020/i18nrtl20.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rtl/021/i18nrtl21.wgt - Tests that nested RTL and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rtl/021/i18nrtl21.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
        it('i18n-rtl/022/i18nrtl22.wgt - Tests that nested RTL and RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
		    testWidget('i18n-rtl/022/i18nrtl22.wgt', done, function (cfg) {
		        expect(cfg.name.visual).toEqual("< PASSED -->");
		    });
		});
    });
    describe('ta-roCaKRxZhS', function () {
        it('i18n-rtl/023/i18nrtl23.wgt - Tests that RTL direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
		    testWidget('i18n-rtl/023/i18nrtl23.wgt', done, function (cfg) {
		        expect(cfg.icons.length).toEqual(1);
		        expect(cfg.icons[0].path).toEqual("test.png");
		    });
		});
    });
    describe('ta-LQcjNKBLUZ', function () {
        it('i18n-rtl/026/i18nrtl26.wgt - Tests that RTL direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
		    testWidget('i18n-rtl/026/i18nrtl26.wgt', done, function (cfg) {
		        expect(cfg.startFile.path).toEqual("pass.htm");
		    });
		});
    });
    describe('ta-paIabGIIMC', function () {
        it('i18n-rtl/027/i18nrtl27.wgt - Tests that RTL direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-rtl/027/i18nrtl27.wgt', done, function (cfg) {
		        expect(cfg.content.type).toEqual("text/html");
		    });
		});
    });
    describe('ta-dPOgiLQKNK', function () {
        it('i18n-rtl/028/i18nrtl28.wgt - Tests that RTL direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
		    testWidget('i18n-rtl/028/i18nrtl28.wgt', done, function (cfg) {
		        expect(cfg.content.encoding).toEqual("iso-8859-1");
		    });
		});
    });
    describe('ta-rZdcMBExBX', function () {
        it('i18n-rtl/029/i18nrtl29.wgt - NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RTL direction does not apply to the feature element\'s name attribute.	To pass, the displayed value must render as "feature:a9bb79c1".',
		function (done) {
		    testWidget('i18n-rtl/029/i18nrtl29.wgt', done, function (cfg) {
		        expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
		    });
		});
        it('i18n-rtl/030/i18nrtl30.wgt - Tests that RTL direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
		    testWidget('i18n-rtl/030/i18nrtl30.wgt', done, function (cfg) {
		        expect(cfg.features[0].required).toBeFalsy();
		    });
		});
    });
    describe('ta-CEGwkNQcWo', function () {
        it('i18n-rtl/031/i18nrtl31.wgt - Tests that RTL direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/031/i18nrtl31.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rtl/032/i18nrtl32.wgt - Tests that RTL direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/032/i18nrtl32.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-DwhJBIJRQN', function () {
        it('i18n-rtl/033/i18nrtl33.wgt - Tests that RTL direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/033/i18nrtl33.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rtl/034/i18nrtl34.wgt - Tests that RTL direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/034/i18nrtl34.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rtl/035/i18nrtl35.wgt - Tests that RTL direction does not apply to the preference element\'s readonly attribute.	To pass, the value must render as "true".',
		function (done) {
		    testWidget('i18n-rtl/035/i18nrtl35.wgt', done, function (cfg) {
		        expect(cfg.preferences[0].readonly).toBeTruthy();
		    });
		});
    });
    describe('ta-argMozRiC', function () {
        it('i18n-rtl/036/i18nrtl36.wgt - Tests that RTL direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rtl/036/i18nrtl36.wgt', done, function (cfg) {
		        expect(cfg.author.href).toEqual("http://widget.example.org/");
		    });
		});
        it('i18n-rtl/037/i18nrtl37.wgt - Tests that RTL direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/037/i18nrtl37.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });
    describe('ta-YUMJAPVEgI', function () {
        it('i18n-rtl/038/i18nrtl38.wgt - Tests that RTL direction does not apply to the license element\'s href attribute.	To pass, the license element\'s href attribute must remain as "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rtl/038/i18nrtl38.wgt', done, function (cfg) {
		        expect(cfg.license.href).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-UScJfQHPPy', function () {
        it('i18n-rtl/039/i18nrtl39.wgt - Tests that RTL direction does not apply to the widget element\'s width attribute.	To pass, the widget element\'s width attribute must be "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-rtl/039/i18nrtl39.wgt', done, function (cfg) {
		        expect(cfg.width).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-BxjoiWHaMr', function () {
        it('i18n-rtl/040/i18nrtl40.wgt - Tests that RTL direction does not apply to the widget element\'s height attribute.	To pass, the widget element\'s height attribute must remain as "123" or a value greater than 0.',
		function (done) {
		    testWidget('i18n-rtl/040/i18nrtl40.wgt', done, function (cfg) {
		        expect(cfg.height).toBeGreaterThan(0);
		    });
		});
    });
    describe('ta-RawAIWHoMs', function () {
        it('i18n-rtl/041/i18nrtl41.wgt - Tests that RTL direction does not apply to the widget element\'s id attribute.	To pass, the widget element\'s id attribute value must be "http://widget.example.org/".',
		function (done) {
		    testWidget('i18n-rtl/041/i18nrtl41.wgt', done, function (cfg) {
		        expect(cfg.id).toEqual("http://widget.example.org/");
		    });
		});
    });
    describe('ta-VerEfVGeTc', function () {
        it('i18n-lro/042/i18nlro42.wgt - Tests that LRO direction applies to the widget element\'s version attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
		    testWidget('i18n-lro/042/i18nlro42.wgt', done, function (cfg) {
		        expect(cfg.version.visual).toEqual("??????");
		    });
		});
        it('i18n-ltr/042/i18nltr42.wgt - Tests that LTR direction applies to the widget element\'s version attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-ltr/042/i18nltr42.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
        it('i18n-rlo/042/i18nrlo42.wgt - Tests that RLO direction applies to the widget element\'s version attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
		    testWidget('i18n-rlo/042/i18nrlo42.wgt', done, function (cfg) {
		        expect(cfg.version.visual).toEqual("PASSED");
		    });
		});
        it('i18n-rtl/042/i18nrtl42.wgt - Tests that RTL direction applies to the widget element\'s version attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
		    testWidget('i18n-rtl/042/i18nrtl42.wgt', done, function (cfg) {
		        expect("todo").toEqual("done");
		    });
		});
    });

} ());
