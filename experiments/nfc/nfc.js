var nfc = require('./build/default/nfc');

nfc.callback = function(tag) {
  console.log('found: ' + tag);
};

nfc.start();

// Now wait indefinitely so that background thread can send us events.
// Plan to add support for stop() method or to replace start() by a
// discover method that takes the call back function as its argument,
// where you call this with NULL to stop listening.

function loopback()
{
  setTimeout(loopback, 500);
}

loopback();
