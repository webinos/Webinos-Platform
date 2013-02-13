var vehicle;
var services;
var listeners;
var listenersDeviceOrientation;
var _vehicleDataIds;
$(document).ready(function () {
  $('#vt_registerBrowser').bind('click', function () {
    services = {};
    vehicle = null;
    $('#serviceList').empty();
    webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
      onFound: function (service) {
        $('#serviceList').removeAttr('disabled');
        $('#vt_initVehicle').removeAttr('disabled');
        services[service.serviceAddress] = service;
        $('#serviceList').append($('<option>' + service.serviceAddress + '</option>'));
        postMessage('Info', 'Service found at ' + service.serviceAddress + '. Please bind to one service to continue.');
        console.log(service);
      }
    });
  });

  function printInfo(data) {
    $('#vt_message').append('<li>' + data.payload.message + '</li>');
  }
  webinos.session.addListener('info', printInfo);
  vehicle = null;
  listeners = new Array(); //FOR VEHICLE EVENTS
  _vehicleDataIds = [{
    type: 'climate-all',
    supported: false
  }, {
    type: 'climate-driver',
    supported: true
  }, {
    type: 'climate-behind-driver',
    supported: false
  }, {
    type: 'climate-passenger',
    supported: true
  }, {
    type: 'climate-behind-passenger',
    supported: false
  }, {
    type: 'light-fog-front',
    supported: true
  }, {
    type: 'light-fog-rear',
    supported: true
  }, {
    type: 'light-signal-left',
    supported: false
  }, {
    type: 'light-signal-right',
    supported: false
  }, {
    type: 'light-signal-warn',
    supported: false
  }, {
    type: 'light-parking',
    supported: true
  }, {
    type: 'light-hibeam',
    supported: true
  }, {
    type: 'light-head',
    supported: true
  }, {
    type: 'gear',
    supported: true
  }, {
    type: 'tripcomputer',
    supported: true
  }, {
    type: 'parksensors-front',
    supported: true
  }, {
    type: 'parksensors-rear',
    supported: true
  }, {
    type: 'wipers',
    supported: true
  }, {
    type: 'tirepressure',
    supported: false
  }, {
    type: 'doors',
    supported: true
  }, {
    type: 'windows',
    supported: true
  }, {
    type: 'engineoil',
    supported: true
  }];
  postMessage('Info', 'Page loaded. Please Initialize');
  $("#vt_pdcLauncher").fancybox({
    'transitionIn': 'fade',
    'transitionOut': 'fade',
    'showCloseButton': false
  });
  var handleShiftData = function (event) {
    //Neutral 11, Parking 10; Rear 0
    gear = parseInt(event.gear);
    switch (gear) {
      case 0:
        gear = 'R';
        break;
      case 10:
        gear = 'P'
        break;
      case 11:
        gear = 'N'
        break;
      default:
        gear = '' + gear;
    }
    postMessage("info", "new Shift-Event received.");
    $('#vt_info').html("gear: <br />" + gear);
  };
  var handleTripData = function (data) {
    postMessage("info", "new TripComputer-Event received.");
    $('#vt_info').empty();
    console.log(data);
    $('#vt_info').append("<p>Average Consumption: " + data.averageConsumption + "</p>");
    $('#vt_info').append("<p>Trip Consumption: " + data.tripConsumption + "</p>");
    $('#vt_info').append("<p>Average Speed: " + data.averageSpeed + "</p>");
    $('#vt_info').append("<p>Trip Speed: " + data.tripSpeed + "</p>");
    $('#vt_info').append("<p>Trip distance: " + data.tripDistance + "</p>");
    $('#vt_info').append("<p>Mileage " + data.mileage + "</p>");
    $('#vt_info').append("<p>Range " + data.range + "</p>");
    $('#vt_info').append("<p>Timestamp " + data.timestamp + "</p>");
  }
  var handleNavigation = function (data) {
    postMessage("info", ".");
    $('#vt_info').empty();
    $('#vt_info').append("<p>Type: " + data.type + "</p>");
    $('#vt_info').append("<p>county: " + data.address.country + "</p>");
    $('#vt_info').append("<p>region: " + data.address.region + "</p>");
    $('#vt_info').append("<p>county: " + data.address.county + "</p>");
    $('#vt_info').append("<p>city: " + data.address.city + "</p>");
    $('#vt_info').append("<p>street: " + data.address.street + "</p>");
    $('#vt_info').append("<p>streetNumber: " + data.address.streetNumber + "</p>");
    $('#vt_info').append("<p>premises: " + data.address.premises + "</p>");
    $('#vt_info').append("<p>additionalInformation: " + data.address.additionalInformation + "</p>");
    $('#vt_info').append("<p>postalCode: " + data.address.postalCode + "</p>");
  }
  var handleParkSensorsData = function (data) {
    postMessage("info", "new ParkSensorsData received for position: " + data.position);
    $('#vt_info').empty();
    $('#vt_info').append("<p>Position: " + data.position + "</p>");
    $('#vt_info').append("<p>OutLeft: " + data.outLeft + "</p>");
    $('#vt_info').append("<p>Left: " + data.left + "</p>");
    $('#vt_info').append("<p>Middle Left: " + data.midLeft + "</p>");
    $('#vt_info').append("<p>Middle Right: " + data.midRight + "</p>");
    $('#vt_info').append("<p>Right: " + data.right + "</p>");
    $('#vt_info').append("<p>OutRight: " + data.outRight + "</p>");
  }
  var handleClimateControlData = function (data) {
    postMessage("info", "new ClimateControlData received : " + data.zone);
    $('#vt_info').empty();
    $('#vt_info').append("<p>zone: " + data.zone + "</p>");
    $('#vt_info').append("<p>desiredTemperature: " + data.desiredTemperature + "</p>");
    $('#vt_info').append("<p>acstatus: " + data.acstatus + "</p>");
    $('#vt_info').append("<p>ventLevel: " + data.ventLevel + "</p>");
    $('#vt_info').append("<p>ventMode: " + data.ventMode + "</p>");
  }
  var handleLightWiperControlData = function (data) {
    postMessage("info", "new ControlData received : " + data.controlId);
    console.log(data);
    $('#vt_info').empty();
    $('#vt_info').append("<p>ControlID: " + data.controlId + "</p>");
    $('#vt_info').append("<p>Active: " + data.active + "</p>");
  }
  var handleStatus = function (e) {
    $('#vt_info').empty();
    $('#vt_info').html(e.controlId + ": <br />" + e.status + "<br />Timestamp: " + e.timestamp);
  }
  var errorCB = function (error) {
    postMessage('error', "ERROR:" + error.message);
    console.log('error' + error.message);
  };
  $('#vt_vehicleDataId').change(function () {
    var listenerRegistered = false;
    for (i = 0; i < listeners.length; i++) {
      if (listeners[i] == $('#vt_vehicleDataId').val()) {
        listenerRegistered = true;
        break;
      }
    }
    if (listenerRegistered) {
      $('#vt_removeListener').removeAttr('disabled');
      $('#vt_addListener').attr('disabled', 'true');
    } else {
      $('#vt_addListener').removeAttr('disabled');
      $('#vt_removeListener').attr('disabled', 'true');
    }
  });
  $('#serviceList').change(function () {
    if ($('#vt_pzh_pzp_list').val() != '') {
      $('#vt_initVehicle').removeAttr('disabled');
    } else {
      $('#vt_initVehicle').attr('disabled', 'true');
    }
  });
  $('#vt_startTripcomputer').click(function () {
    $('#vt_info').html('Tripcomputer has been launched in a new window.');
    window.open('/testbed/vehicle/tripcomputer/index.html', '_blank');
    window.focus();
  });
  $('#vt_vehicleDataId').change(function () {
    if ($('#vt_vehicleDataId').val().indexOf('destination') != -1) {
      $('#vt_getData').attr('disabled', 'true');
    } else {
      $('#vt_getData').removeAttr('disabled');
    }
  });
  $('#vt_clear').bind('click', function () {
    $('#vt_info').empty();
  });
  $('#vt_getData').bind('click', function () {
    vehicle.get($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), errorCB);
  });
  $('#vt_initVehicle').click(function (e) {
    vehicle = services[$('#serviceList option:selected').val()];
    vehicle.bindService({
      onBind: function (service) {
        postMessage('Info', 'Connection to Vehicle Service at ' + service.serviceAddress + ' has been established.');
        $('#vt_addListener').removeAttr('disabled');
        $('#vt_getData').removeAttr('disabled');
        $('#vt_startPdc').removeAttr('disabled');
        $('#vt_vehicleDataId').removeAttr('disabled');
        if (service.displayName.indexOf("Simulator") != -1) {
          $('#simulatorHint').removeClass('disabled');
        }
        $('#vt_info').html("Select a vehicle property or start an app!");
        $('#vt_play').removeClass('disabled');
        $('#vt_outer_info').removeClass('disabled');
      }
    });
  });
  var disableInit = function (name, btnId, pzx) {
    btnId.val(name + ' connected to ' + pzx);
    btnId.addClass('running');
    btnId.attr('disabled', 'true');
  }
  var pdcActivated = false;
  $('#vt_startPdc').bind('click', function () {
    if (!pdcActivated) {
      pdcActivated = true;
      vehicle.addEventListener('gear', pdcAppHandler, false);
      vehicle.get('gear', pdcAppHandler, errorCB);
      postMessage('info', 'Listener for PDC-App registered');
      $('#vt_startPdc').val('PDC App (running)');
      $('#vt_startPdc').addClass('running');
      $('#vt_info').html('PDC app is activated. View is launched, when Gear is put into R.');
    } else {
      $('#vt_startPdc').val('PDC App');
      $('#vt_startPdc').removeClass('running');
      pdcActivated = false;
      vehicle.removeEventListener('gear', pdcAppHandler, false);
      $('#vt_info').html('PDC app has been disabled.')
    }
  });
  $('#vt_addListener').bind('click', function () {
    vehicle.addEventListener($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), false);
    listeners.push($('#vt_vehicleDataId').val());
    $('#vt_removeListener').removeAttr('disabled');
    $('#vt_addListener').attr('disabled', 'true');
  });
  $('#vt_removeListener').bind('click', function () {
    vehicle.removeEventListener($('#vt_vehicleDataId').val(), getMessageHandler($('#vt_vehicleDataId').val()), false);
    postMessage('info', 'Listener removed for' + $('#vehicleDataId').val());
    $('#vt_info').html("<img src='/client/vehicle/general/ajaxloader.gif'>");
    for (i = 0; listeners.length; i++) {
      if (listeners[i] == $('#vt_vehicleDataId').val()) {
        listeners.splice(i, 1);
        break;
      }
    }
    $('#vt_addListener').removeAttr('disabled');
    $('#vt_removeListener').attr('disabled', 'true');
  });
  $(window).unload(function (e) {
    for (i = 0; i < listeners.length; i++) {
      console.log('Removing listener for ' + listeners[i]);
      vehicle.removeEventListener(listeners[i], getMessageHandler(listeners[i]), false);
    }
  });

  function postMessage(type, message) {
    var time = new Date();
    $("#vt_message").html(message + " (" + time.toUTCString() + ")");
    if (type == "error") {
      $("#vt_status").addClass('error');
    } else {
      $("#vt_status").removeClass('error');
    }
  }

  function getMessageHandler(type) {
    switch (type) {
      case "gear":
        return handleShiftData;
        break;
      case "tripcomputer":
        return handleTripData;
        break;
      case "parksensors-front":
        return handleParkSensorsData;
        break;
      case "parksensors-rear":
        return handleParkSensorsData;
        break;
      case "climate-all":
        return handleClimateControlData;
        break;
      case "climate-driver":
        return handleClimateControlData;
        break;
      case "climate-passenger":
        return handleClimateControlData;
        break;
      case "climate-behind-driver":
        return handleClimateControlData;
        break;
      case "climate-behind-passenger":
        return handleClimateControlData;
        break;
      case "light-fog-front":
        return handleLightWiperControlData;
        break;
      case "light-fog-rear":
        return handleLightWiperControlData;
        break;
      case "light-signal-left":
        return handleLightWiperControlData;
        break;
      case "light-signal-right":
        return handleLightWiperControlData;
        break;
      case "light-signal-warn":
        return handleLightWiperControlData;
        break;
      case "light-parking":
        return handleLightWiperControlData;
        break;
      case "light-hibeam":
        return handleLightWiperControlData;
        break;
      case "light-head":
        return handleLightWiperControlData;
        break;
      case "deviceorientation":
        return handleDeviceOrientation;
        break;
      case "devicemotion":
        return handleDeviceMotion;
        break;
      case "compassneedscalibration":
        return handleCompassNeedsCalibration;
        break;
      case "wipers":
        return handleStatus;
        break;
      case "engineoil":
        return handleStatus;
        break;
      case "windows":
        return handleGeneric;
      case "doors":
        return handleGeneric;
      default:
        return handleShiftData;
    }
  }

  function handleGeneric(data) {
    console.log('Generic: ')
    console.log(data);
  }

  function fillSelectionBoxAdvanced(id, values) {
    for (i = 0; i < values.length; i++) {
      var opt = new Option(values[i].type, values[i].type, false, false);
      if (values[i].supported) {
        $(id).append(opt);
      }
    }
  }
  fillSelectionBoxAdvanced('#vt_vehicleDataId', _vehicleDataIds);

  function drawPdcBase(position) {
    if (position == "parksensors-front") {
      canvas = $('#vt_pdcFront');
      centerX = 200;
      centerY = 75;
      start = 250;
      end = 290;
      radius = 154;
      width = 88;
    } else if (position == "parksensors-rear") {
      canvas = $('#vt_pdcRear');
      centerX = -100;
      centerY = 75;
      start = 70;
      end = 110;
      radius = 154;
      width = 88;
    }
    canvas.clearCanvas();
    canvas.drawArc({
      strokeStyle: "#6C8080",
      opacity: 0.4,
      strokeWidth: width,
      x: centerX,
      y: centerY,
      radius: radius,
      start: start,
      end: end
    });
  }

  function drawPdcObstacles(params) {
    position = params.position;
    left = params.left;
    midLeft = params.midLeft;
    midRight = params.midRight;
    right = params.right;
    widthRed = 10;
    widthYellow = 14;
    widthGreen = 20;
    radiusGreen1 = 188;
    radiusGreen2 = 168;
    radiusYellow1 = 151;
    radiusYellow2 = 137;
    radiusRed1 = 125;
    radiusRed2 = 115;
    green = "#51FF19"
    yellow = "#F3FF17";
    red = "#FF3E00";
    if (position == "parksensors-front") {
      canvas = $('#vt_pdcFront');
      centerX = 200;
      centerY = 75;
      //250 -- 290					
      leftStart = 250;
      leftEnd = 260;
      midLeftStart = 260;
      midLeftEnd = 270;
      midRightStart = 270;
      midRightEnd = 280;
      rightStart = 280;
      rightEnd = 290;
    } else if (position == "parksensors-rear") {
      canvas = $('#vt_pdcRear');
      centerX = -100;
      centerY = 75;
      //70 -- 110					
      leftStart = 70;
      leftEnd = 80;
      midLeftStart = 80;
      midLeftEnd = 90;
      midRightStart = 90;
      midRightEnd = 100;
      rightStart = 100;
      rightEnd = 110;
    }
    drawPdcBase(position);
    //250 185  120 80 40 20
    //GREEN  ONE
    ///LEFT
    if (left < 250) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen1,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 250) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen1,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    if (midRight < 250) {
      ///MIDRIGHT
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen1,
        start: midRightStart,
        end: midRightEnd
      });
    }
    ///RIGHT
    if (right < 250) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen1,
        start: rightStart,
        end: rightEnd
      });
    }
    //GREEN TWO
    ///LEFT
    //250 185  120 80 40 20
    if (left < 185) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen2,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 185) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen2,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    ///MIDRIGHT
    if (midRight < 185) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen2,
        start: midRightStart,
        end: midRightEnd
      });
    }
    ///RIGHT
    if (right < 185) {
      canvas.drawArc({
        strokeStyle: green,
        strokeWidth: widthGreen,
        x: centerX,
        y: centerY,
        radius: radiusGreen2,
        start: rightStart,
        end: rightEnd
      });
    }
    //YELLOW ONE
    ///LEFT
    if (left < 120) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow1,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 120) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow1,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    ///MIDRIGHT
    if (midRight < 120) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow1,
        start: midRightStart,
        end: midRightEnd
      });
    }
    if (right < 120) {
      ///RIGHT
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow1,
        start: rightStart,
        end: rightEnd
      });
    }
    //YELLOW TWO
    ///LEFT
    if (left < 80) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow2,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 80) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow2,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    ///MIDRIGHT
    if (midRight < 80) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow2,
        start: midRightStart,
        end: midRightEnd
      });
    }
    ///RIGHT
    if (right < 80) {
      canvas.drawArc({
        strokeStyle: yellow,
        strokeWidth: widthYellow,
        x: centerX,
        y: centerY,
        radius: radiusYellow2,
        start: rightStart,
        end: rightEnd
      });
    }
    //RED ONE
    ///LEFT
    if (left < 40) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed1,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 40) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed1,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    ///MIDRIGHT
    if (midRight < 40) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed1,
        start: midRightStart,
        end: midRightEnd
      });
    }
    ///RIGHT
    if (right < 40) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed1,
        start: rightStart,
        end: rightEnd
      });
    }
    //RED TWO
    ///LEFT
    if (left < 20) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed2,
        start: leftStart,
        end: leftEnd
      });
    }
    ///MIDLEFT
    if (midLeft < 20) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed2,
        start: midLeftStart,
        end: midLeftEnd
      });
    }
    ///MIDRIGHT
    if (midRight < 20) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed2,
        start: midRightStart,
        end: midRightEnd
      });
    }
    ///RIGHT
    if (right < 20) {
      canvas.drawArc({
        strokeStyle: red,
        strokeWidth: widthRed,
        x: centerX,
        y: centerY,
        radius: radiusRed2,
        start: rightStart,
        end: rightEnd
      });
    }
  }

  function pdcAppHandler(event) {
    //Neutral 11, Parking 10; Rear 0
    if (parseInt(event.gear) == 0) {
      //poping up PDC app...
      alert("launching pdc");
      $("#vt_pdcLauncher").trigger('click');
      drawPdcBase("parksensors-front");
      drawPdcBase("parksensors-rear");
      vehicle.get('parksensors-front', drawPdcObstacles, errorCB);
      vehicle.get('parksensors-rear', drawPdcObstacles, errorCB);
      vehicle.addEventListener('parksensors-front', drawPdcObstacles, false);
      vehicle.addEventListener('parksensors-rear', drawPdcObstacles, false);
    } else if (event.gear >= 2) {
      $.fancybox.close();
      vehicle.removeEventListener('parksensors-front', drawPdcObstacles, false);
      vehicle.removeEventListener('parksensors-rear', drawPdcObstacles, false);
      if (event.gear == 10 || event.gear == 11) {
        postMessage('info', 'Vehicle parked. Disabling PDC app');
      } else {
        postMessage('info', 'Driving again. Disabling PDC app');
      }
    }
  }
});
