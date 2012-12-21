/**
 * Fetches the public IP address if hostname is not specified
 * @param callback - empty callback to get async behavior
 */

exports.getHostName = function(hostname, callback) {
    var net = require("net");
    if (hostname === undefined || hostname === null || hostname === "") {
        var socket = net.createConnection(80, "www.google.com");
        socket.on('connect', function() {
            socket.end();
            hostname =  socket.address().address;
            return callback(hostname);
        });
        socket.on('error', function() { // Assuming this will happen as internet is not reachable
            hostname =  "0.0.0.0";
            return callback(hostname);
        });
    } else {
        callback(hostname);
    }
};