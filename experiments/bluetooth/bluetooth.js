var bluetooth = require('./build/default/bluetooth');

bluetooth.callback = function(address, dev_name, dev0, dev1, dev2) {
  console.log('found: ' + address + ' ' + dev_name + ' [' + dev0 + ', ' + dev1 + ', ' + dev2 + ']');
};

bluetooth.start();

// now wait indefinitely so that background thread can send us events

function loopback()
{
  setTimeout(loopback, 500);
}

loopback();
