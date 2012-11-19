var ks = require('../../src/build/Release/keystore.node');

describe("Manager.Keystore", function() {
  
  /*it('add and return a simple secret', function() {
    var secretKey = "mySecret";
    var secret = "987654321";
    ks.put(secretKey,secret);
    var secOut = ks.get(secretKey);
    expect(secOut).toEqual(secret);
  });*/

  /*it('delete the simple secret', function() {
    var secretKey = "mySecret";
    ks.delete(secretKey);
  });*/

  it('delete a non-existing secret', function() {
    var secretKey = "noSecret";
    expect(function(){ks.delete(secretKey);}).toThrow();
  });

});
