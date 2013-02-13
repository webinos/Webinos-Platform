now.ready(function () {
  $('#inputGear').removeAttr('disabled');
});
$(document).ready(function () {
  //$(':checkbox').iphoneStyle();
  $("#slider-pf-or").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-or").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-or" ).val(( "#slider-pf-or" ).slider( "value" ));
  $("#slider-pf-r").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-r").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-r" ).val(( "#slider-pf-r" ).slider( "value" ) );
  $("#slider-pf-mr").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-mr").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-mr" ).val(( "#slider-pf-mr" ).slider( "value" ) );
  $("#slider-pf-ml").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-ml").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-ml" ).val(( "#slider-pf-ml" ).slider( "value" ) );
  $("#slider-pf-l").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-l").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-l" ).val(( "#slider-pf-l" ).slider( "value" ) );
  $("#slider-pf-ol").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pf-ol").val(ui.value);
    },
    stop: function (event, ui) {
      setPsFront();
    }
  });
  //$( "#pf-ol" ).val(( "#slider-pf-ol" ).slider( "value" ) );
  $("#slider-pr-or").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-or").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  //$( "#pr-or" ).val(( "#slider-pr-or" ).slider( "value" ));
  $("#slider-pr-r").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-r").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  //$( "#pr-r" ).val(( "#slider-pr-r" ).slider( "value" ) );
  $("#slider-pr-mr").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-mr").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  //$( "#pr-mr" ).val(( "#slider-pr-mr" ).slider( "value" ) );
  $("#slider-pr-ml").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-ml").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  //$( "#pr-ml" ).val(( "#slider-pr-ml" ).slider( "value" ) );
  $("#slider-pr-l").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-l").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  //$( "#pr-l" ).val(( "#slider-pr-l" ).slider( "value" ) );
  $("#slider-pr-ol").slider({
    range: "min",
    value: 255,
    min: 10,
    max: 255,
    slide: function (event, ui) {
      $("#pr-ol").val(ui.value);
    },
    stop: function (event, ui) {
      setPsRear();
    }
  });
  $("#slider-da-x").slider({
    range: "min",
    value: 0,
    min: 0,
    max: 100,
    step: 0.1,
    slide: function (event, ui) {
      $("#da-x").val(ui.value);
    },
    stop: function (event, ui) {
      setDeviceMotion();
    }
  });
  $("#slider-da-y").slider({
    range: "min",
    value: 0,
    min: 0,
    max: 100,
    step: 0.1,
    slide: function (event, ui) {
      $("#da-y").val(ui.value);
    },
    stop: function (event, ui) {
      setDeviceMotion();
    }
  });
  $("#slider-da-z").slider({
    range: "min",
    value: 0,
    min: 0,
    max: 100,
    step: 0.1,
    slide: function (event, ui) {
      $("#da-z").val(ui.value);
    },
    stop: function (event, ui) {
      setDeviceMotion();
    }
  });
  //$( "#pr-ol" ).val(( "#slider-pr-ol" ).slider( "value" ) );
  if (navigator.geolocation) {
    $('#myLocation').removeAttr('disabled');
  }
  $('#inputGear').change(function () {
    now.setGear($('#inputGear').val());
  });
  $('#pr-or').change(function () {
    setPsRear();
  });
  $('#pr-r').change(function () {
    setPsRear();
  });
  $('#pr-mr').change(function () {
    setPsRear();
  });
  $('#pr-ml').change(function () {
    setPsRear();
  });
  $('#pr-l').change(function () {
    setPsRear();
  });
  $('#pr-ol').change(function () {
    setPsRear();
  });
  $('#pf-or').change(function () {
    setPsFront();
  });
  $('#pf-r').change(function () {
    setPsFront();
  });
  $('#pf-mr').change(function () {
    setPsFront();
  });
  $('#pf-ml').change(function () {
    setPsFront();
  });
  $('#pf-l').change(function () {
    setPsFront();
  });
  $('#pf-ol').change(function () {
    setPsFront();
  });
  $('input[id*="tc-"]').change(function () {
    setTripComputer();
  });
  $('#setTripComputer').click(function () {
    setTripComputer();
  });
  $('#setPsFront').click(function () {
    setPsFront();
  });
  $('#setPsRear').click(function () {
    setPsRear();
  });
  $('#setDeviceMotion').click(function () {
    setDeviceMotion();
  });
  $('#l-fog-front').bind('click', function () {
    now.setLightsFogFront($('#l-fog-front').is(':checked'));
  });
  $('#l-fog-rear').bind('click', function () {
    now.setLightsFogRear($('#l-fog-rear').is(':checked'));
  });
  $('#l-hibeam').bind('click', function () {
    now.setLightsHibeam($('#l-hibeam').is(':checked'));
  });
  $('#l-parking').bind('click', function () {
    now.setLightsParking($('#l-parking').is(':checked'));
  });
  $('#l-head').bind('click', function () {
    now.setLightsHead($('#l-head').is(':checked'));
  });
  $('#l-signal-left').bind('click', function () {
    now.setLightsSignalLeft($('#l-signal-left').is(':checked'));
  });
  $('#l-signal-right').bind('click', function () {
    now.setLightsSignalRight($('#l-signal-right').is(':checked'));
  });
  $('#l-signal-warn').bind('click', function () {
    now.setLightsSignalWarn($('#l-signal-warn').is(':checked'));
  });
  $('#locateOnMap').click(function () {
    var address = $('#d-street').val() + " " + $('d-streetnumber').val() + ", " + $('#d-city').val() + ", " + $('#d-country').val();
    geocoder.geocode({
      'address': address
    }, handleGeocoder);
  });
  $('#setDestinationReached').click(function () {
    now.setDestinationReached(getAdressData());
  });
  $('#setDestinationCancelled').click(function () {
    now.setDestinationCancelled(getAdressData());
  });
  $('#setDestinationChanged').click(function () {
    now.setDestinationChanged(getAdressData());
  });
  $('#setLocation').click(function () {
    setGeolocation();
  });
  $('#c-alt').bind('change', function () {
    setGeolocation();
  });
  $('#c-speed').bind('change', function () {
    setGeolocation();
  });
  $('#c-heading').bind('change', function () {
    setGeolocation();
  });

  function getAdressData() {
    var data = new Object();
    data.street = $('#d-street').val();
    data.streetnumber = $('#d-streetnumber').val();
    data.country = $('#d-country').val();
    data.city = $('#d-city').val();
    data.postalcode = $('#d-postalcode').val();
    data.premises = $('#d-premises').val();
    data.region = $('#d-region').val();
    data.county = $('#d-county').val();
    data.additionals = '';
    return data;
  }
  $('#myLocation').click(function () {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);

    function successFunction(pos) {
      console.log(pos);
      position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      marker.setPosition(position);
      map.setCenter(position);
      $('#c-lat').val(position.lat());
      $('#c-lng').val(position.lng());
      geocoder.geocode({
        'latLng': position
      }, handleReversedGeocoder);
    }

    function errorFunction(position) {
      alert('Error!');
    }
  });
  initializeMap();
});
var centerPoint = new google.maps.LatLng(41.38765942141657, 2.1694680888855373);
var markerPoint = new google.maps.LatLng(41.38765942141657, 2.1694680888855373);
var marker;
var position;
var map;
var geocoder;

function initializeMap() {
  var mapOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: centerPoint
  };
  $('#c-lng').val(markerPoint.lng());
  $('#c-lat').val(markerPoint.lat());
  map = new google.maps.Map(document.getElementById("map_canvas"),
  mapOptions);
  geocoder = new google.maps.Geocoder();
  marker = new google.maps.Marker({
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: markerPoint
  });
  google.maps.event.addListener(marker, 'dragend', handleNewPosition);
}

function handleNewPosition() {
  position = marker.getPosition();
  $('#c-lat').val(position.lat());
  $('#c-lng').val(position.lng());
  geocoder.geocode({
    'latLng': position
  }, handleReversedGeocoder);
}

function setGeolocation() {
  var position = new Object();
  position.coords = new Object();
  position.coords.latitude = $('#c-lat').val();
  position.coords.longitude = $('#c-lng').val();
  position.coords.accuracy = 99;
  position.coords.heading = $('#c-heading').val();
  position.coords.speed = $('#c-speed').val();
  position.coords.altitude = $('#c-alt').val();
  now.setGeolocation(position);
}

function setPsFront() {
  var psData = new Object();
  psData.ol = $('#pf-ol').val();
  psData.l = $('#pf-l').val();
  psData.ml = $('#pf-ml').val();
  psData.mr = $('#pf-mr').val();
  psData.r = $('#pf-r').val();
  psData.or = $('#pf-or').val();
  now.setPsFront(psData);
}

function setPsRear() {
  var psData = new Object();
  psData.ol = $('#pr-ol').val();
  psData.l = $('#pr-l').val();
  psData.ml = $('#pr-ml').val();
  psData.mr = $('#pr-mr').val();
  psData.r = $('#pr-r').val();
  psData.or = $('#pr-or').val();
  now.setPsRear(psData);
}

function setDeviceMotion() {
  var dmData = new Object();
  dmData.acceleration = new Object();
  dmData.acceleration.x = $('#da-x').val();
  dmData.acceleration.y = $('#da-y').val();
  dmData.acceleration.z = $('#da-z').val();
  dmData.rotationRate = new Object();
  dmData.rotationRate.alpha = $('#da-ra').val();
  dmData.rotationRate.beta = $('#da-rb').val();;
  dmData.rotationRate.gamma = $('#da-rg').val();;
  dmData.interval = $('#da-i').val();
  now.setMotion(dmData);
}

function setTripComputer() {
  var tcData = new Object();
  tcData.c1 = $('#tc-c1').val();
  tcData.c2 = $('#tc-c2').val();
  tcData.s1 = $('#tc-s1').val();
  tcData.s2 = $('#tc-s2').val();
  tcData.d = $('#tc-d').val();
  tcData.m = $('#tc-m').val();
  tcData.r = $('#tc-r').val();
  now.setTripComputer(tcData);
}

function updateAddress(address) {
  for (var i = 0; i < address.address_components.length; i++) {
    var component = address.address_components[i];
    switch (component.types[0]) {
      case 'street_number':
        $('#d-streetnumber').val(component.long_name);
        break;
      case 'route':
        $('#d-street').val(component.long_name);
        break;
      case 'country':
        $('#d-country').val(component.long_name);
        break;
      case 'postal_code':
        $('#d-postalcode').val(component.long_name);
        break;
      case 'postal_code':
        $('#d-postalcode').val(component.long_name);
        break;
      case 'administrative_area_level_1':
        //STATES
        $('#d-region').val(component.long_name);
        break;
      case 'administrative_area_level_3':
        //COUNTIES				
        $('#d-county').val(component.long_name);
        break;
      case 'administrative_area_level_2':
        //COUNTIES				
        $('#d-county').val(component.long_name);
        break;
      case 'locality':
        //CITY				
        $('#d-city').val(component.long_name);
        break;
      case 'premise':
        //COUNTIES				
        $('#d-premises').val(component.long_name);
        break;
    }
  }
}

function handleReversedGeocoder(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    if (results[0]) {
      var position = new Object();
      position.coords = new Object();
      position.coords.latitude = results[0].geometry.location.lat()
      position.coords.longitude = results[0].geometry.location.lng();
      position.coords.altitude = $('#c-alt').val();
      position.coords.accuracy = 99;
      position.coords.heading = $('#c-heading').val();
      position.coords.speed = $('#c-speed').val();
      now.setGeolocation(position);
      updateAddress(results[0]);
    }
  } else {
    alert("Geocoder failed due to: " + status);
  }
}

function handleGeocoder(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    if (results[0]) {
      updateAddress(results[0]);
      centerPoint = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      map.setCenter(centerPoint);
      marker.setPosition(centerPoint);
      $('#c-lat').val(centerPoint.lat());
      $('#c-lng').val(centerPoint.lng());
      var position = new Object();
      position.coords = new Object();
      position.coords.latitude = results[0].geometry.location.lat()
      position.coords.longitude = results[0].geometry.location.lng();
      position.coords.altitude = $('#c-alt').val();
      position.coords.accuracy = 99;
      position.coords.heading = $('#c-heading').val();
      position.coords.speed = $('#c-speed').val();
      now.setGeolocation(position);
    }
  } else {
    alert("Geocoder failed due to: " + status);
  }
}
