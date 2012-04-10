Linux: 
	- node-waf configure build
	- (or) tools\gyp_tools\webinos-gyp, then: make

Windows:
	- Download and install MS Visual Studio 2010
	- Download and install OpenSSL for WINDOWS
		- First install Visual C++ 2008 Redistributables
		- Install WIN32 OpenSSL v1.0.1 (Do not use x64)
		- Install OpenSSL into default directory
	- Install Python 2.x
	- Open the Visual Studio Command Prompt and go to webinos\common\manager\certificate_manager\src
	- Execute: tools\gyp_tools\webinos-gyp.bat (This generates build files)
	- Execute: msbuild module.sln

Android:
	ndk-build OSSL_ANDROID_ROOT=<PATH_to_openssl_folder>/openssl-android NDK_PROJECT_PATH=. NDK_APPLICAION_MK=application.mk
	(Copy to these files in appropriate assets directory)
