
In order to build this module you need the .lib to link against and
the header files from the OpenSSL library.

You should download the full Win32 OpenSSL v1.0.0e package from
    http://www.slproweb.com/products/Win32OpenSSL.html
which includes all needed files. Don't use the "Light" installer.

After installing OpenSSL:
1. Open module.gyp.
2. Change the "openssl_Root" path variable to point to your OpenSSL installation.
3. Build the module using VS or MSBuild.

Make sure you're using forward slashes in your path, i.e. "/" instead of the
usual backslashes for Windows.

For more on how node modules are built on Windows see the WP4 Wiki:
http://dev.webinos.org/redmine/projects/wp4/wiki/Webinos-gyp