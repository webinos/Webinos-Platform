
A basic webinos signed widget
===

This is a sample that demonstrates the basics of building a webinos widget.

### Authoring the widget

Widgets are built using standard web technologies - HTML, javascript and css. However for security reasons it is necessary to adopt best practices in terms of how javascript and css is included in your widget as the webinos widget renderer does not support inline javascript or style definitions.

So avoid the following

    <script type="text/javascript">
        function myAmazingFunction() {
           ...
        }
    </script>
    <div style="width: 100px; padding: 20px"></div>

And instead us separate css and javascript files.

    <link type="text/css" href="style.css" rel="stylesheet" />
    <script src="myScript.js"></script>
    <div class="myClass">...</div>

As with any web application, you can use folders to keep your widget code neat and tidy.

##### Accessing webinos APIs

When your widget is loaded and run by the webinos widget renderer, a new object is automatically added to the javascript object model for you. You don't need to take any special action to enable this. The object is called webinos, and you use this object to access all the webinos functionality.

    function widgetStartup() {
        // See what file API services are available
        webinos.discovery.findServices({api:"http://webinos.org/api/file"},{onFound:serviceFoundCB, onLost:serviceLostCB, onError:error}, null, null);
    }

### Signing the widget

Refer to the [widget signing instructions](https://developer.webinos.org/widget-signing-and-verification-tools)

This widget was signed using the steps outlined in the above link, using both an author signature and a distributor signature.

##### author signature

    tools/sign-widget.sh --pkcs12 /path/to/test-suite/keys/3.rsa.p12 --pwd secret -x -c -a /path/to/test-suite/keys/3.rsa.cert.pem -c /path/to/test-suite/keys/2.rsa.cert.pem /path/to/hello-world-signed/.wgt

#### distributor signature

    tools/sign-widget.sh --pkcs12 /path/to/test-suite/keys/3.rsa.p12 --pwd secret -x -c /path/to/test-suite/keys/3.rsa.cert.pem -c /path/to/test-suite/keys/2.rsa.cert.pem /path/to/hello-world-signed/.wgt

After running the sign-widget tool you should see two new files in the widget folder - author-signature.xml and signature1.xml. You can now package your widget.

### Packaging the widget

To package the widget, you simply need to zip up the contents of the widget folder. A common mistake at this point is to zip up the actual widget folder, whereas what you want to do is zip up only the contents of the folder.

For example, in Windows, open Explorer and navigate to the widget folder (e.g. c:\users\alice\webinos-platform\webinos\samples\widgets\hello-world-signed\.wgt). Select all the contents of the folder, then right-click and select Send To -> Zip File

n.b. Do not right click on the .wgt folder and compress that - the package should only include the widget content, not the root containing folder.

On Ubuntu, the process is similar - open a folder window and navigate to the widget folder. Select all the contents and then right click and select Compress...

Rename the resulting file, changing the .zip extension to .wgt. You now have a signed widget.

### Running the widget

Assuming you have the webinos runtime installed, you should be able to double-click on the .wgt file createed in the previous step and it will be installed and run straight away.

### More information

Find out more, participate and get support at [developer.webinos.org](http://developer.webinos.org)
