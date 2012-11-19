var webinosPZH = {
  init: function() {

  },
  commands: {
    authenticate: {
      google: function() {
        var options = {type: 'prop', payload: {status:'authenticate', message: "google"}};
        webinos.session.message_send(options, to);
      },
      yahoo: function() {
        var options = {type: 'prop', payload: {status:'authenticate', message: "yahoo"}};
        webinos.session.message_send(options, to);
      }
    }
  }
};
