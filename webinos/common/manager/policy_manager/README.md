Policy Manager provides following functionalities:
- Provide a mediation interface, so that all components may defer decision to the access logic
- Interpret the set of policy rules active on the PZP
- Implement real-time PEP logic and enforce the constraints

To run policy manager:
Linux/Mac: 
	- node-waf configure build
	- (or) tools/gyp-folder/webinos-gyp.bat

Android:
	- ndk-build NDK_PROJECT_PATH=. NDK_APPLICATION_MK=Application.mk




