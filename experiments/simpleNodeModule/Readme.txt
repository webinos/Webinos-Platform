Define a system variable named NODE_ROOT to point to your node folder, the one that contains the src, deps and Release of Debug folder. The script will verify that the requested files do exist.

Run vcbuild.bat and if you see the Finished message you are all done otherwise you have to see the log (console output) to debug what's wrong.

To test your new module (assuming node is in the path):
node test.js