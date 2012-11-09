December 13, 2011

In order to make path resolution easier, in this module all the webinos path are defined wrt WEBINOS_PATH, that is the folder named "webinos" in the repository, i.e. <PATH_WHERE_YOU_CLONED_REPOSITORY_ON_YOUR_PLATFORM>/wp4/webinos.

Directory structure of this module:
webinos/
	api/
		contacts/
			lib/ : contains all js scripts
			src/ : contains wscript, module.gyp
				/thunderbird_AB_parser: contains cpp thunderbird Address Book parser sources
			contrib/ : contains: mork parser sources (3rd party)
			node_modules/ : contains dependency modules (xml2js and seq and their subdependencies)
			test/
				test_contacts_module_standalone.js	:a standalone js test script that can be run from node.js
			package.json
			dependencies.json
			pom.xml

To test the module, go into test folder and run test_contacts_module_standalone.
run either:
	node test_contacts_module_standalone remote <google_username> <password>
or
	node test_contacts_module_standalone local thunderbird_contacts_test/testAddressBook/abook.mab (or set the path to your address book)
or
	node test_contacts_module --help

ISSUES:
-currently gyp file does not work generate a valid project
-inclusion of localcontacts will be made conditiona, in order to exclude it from the android branch


