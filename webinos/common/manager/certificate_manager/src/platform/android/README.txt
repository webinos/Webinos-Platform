You need to define openssl-android path to get this work.

ndk-build OSSL_ANDROID_ROOT=<path_to_openssl-android> NDK_PROJECT_PATH=. NDK_APPLICATION_MK=Application.mk

Please refer to:
https://github.com/paddybyers/anode/wiki/Build
https://github.com/paddybyers/anode/wiki/Addons

