Requirements
------------

In order to setup a dev environment for windows you will need the following:

- Python: Download from http://python.org/download/, install and make sure that you add python folder in the path.
- Visual Studio with C++ support: You may download the express edition from http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express.
- Apache-ant: Download binaries from http://ant.apache.org/bindownload.cgi, extract them and add the bin folder to your path.
- Source code of node:  
	1) Clone repo https://github.com/joyent/node.git. 
	2) Execute vcbuild.bat that is located in the root of the repo. 
	3) Add an environment variable named "NODE_ROOT" to point to that directory (e.g. C:\DEVELOPMENT\Webinos\Node).
- OpenSSL-Win32: Download from http://www.slproweb.com/products/Win32OpenSSL.html. Don't use the "Light" installer and install it on the default path (e.g. C:\OpenSSL-Win32).
- Google Chrome: Download and install from https://www.google.com/chrome

If you want to run the XMPP support, you must read the wiki for a list of required modules (http://dev.webinos.org/redmine/projects/wp4/wiki/Windows_Build_Instructions).

Scipts description
------------------
- 01.StartPZH.bat: Starts the pzh. Optional.
- 02.StartPZP.bat: Starts pzp. If you have started the pzh, the pzp will connect to it.
- 03.OpenTestPageInChrome.bat: Fires up chrome and navigates to the test bed page where you can test the api's
- 99.BuildPlatform.bat: Builds the webinos native modules (based on the module.gyp files) and creates the webinos.js wrt file. This is required only when you pull new sources from the git.

Running WP5 Demos
-----------------
In order to run the wp5 demos, you must clone the wp5 git and link the common folder inside the wp4\demo folder. Moreover you will have to link each demo app's folder in the wp4\demo folder. To do the linking you may use the following opensource tool http://dirlinker.codeplex.com/.
This linking will be done only once. After that you start pzh and pzp and you may visit the demo page by browsing (using chrome!) to http://localhost:8080/<YourDemoAppFolderLinkName>. Feel free to copy the 03.OpenTestPageInChrome.bat and modify it to start your demo's land page.


*** Feel free to add tutorials in this file (although the wiki is prefered and then just and a link in this file) ***