var webinosPZH = {
  init: function() {

  },
  commands: {
    authenticate: {
      google: function() {
        console.log("authenticate google");
        var options = {type: 'prop', payload: {status:'authenticate-google', to: to}};
        webinos.session.message_send(options);
      },
      yahoo: function() {
        var options = {type: 'prop', payload: {status:'authenticate-yahoo', to: to}};
        webinos.session.message_send(options);
      }
    }
  }
};
