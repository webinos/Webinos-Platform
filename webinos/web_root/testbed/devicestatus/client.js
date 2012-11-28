var devicestatusServices, devicestatusService;

$(document).ready(
    function () {

        $('#findService').bind('click', function () {
            devicestatusServices = {};
            recentService = null;
            $('#servicesList').empty();
            webinos.discovery.findServices(new ServiceType('http://wacapps.net/api/devicestatus'),
                {onFound:function (service) {
                    devicestatusServices[service.serviceAddress] = service;
                    $('#servicesList').append($('<option>' + service.serviceAddress + '</option>'));
                }});
        });

        $('#bindService').bind('click', function () {
            devicestatusService = devicestatusServices[$('#servicesList option:selected').val()];
            devicestatusService.bindService({onBind:function (service) {
                alert('DeviceStatus API ' + service.api + ' bound.');
                loadAspects();
            }});
        });

        $('#getComponents').click(
            function () {
                var aspect = $('#aspectsList option:selected').val();
                loadProperties(aspect);

                var successCB = function (value) {
                    loadComponents(value);
                };
                var errorCB = function (value) {
                    alert("Error: " + value);
                };
                devicestatusService.getComponents(aspect, successCB, errorCB);
            }
        );


        $('#getPropertyValue').click(
            function () {

                var prop = {
                    component:$('#componentsList option:selected').val(),
                    aspect:$('#aspectsList option:selected').val(),
                    property:$('#propertiesList option:selected').val()
                };
                var successCB = function (value) {
                    alert("Success => " + prop.property + ": " + value);
                };
                var errorCB = function (value) {
                    alert("Error: " + value);
                };
                devicestatusService.getPropertyValue(successCB, errorCB, prop);
            }
        );

        function loadAspects() {
            $('#aspectsList').empty();
            for (var aspect in vocabulary) {
                var successCB = function (res) {
                    if (res.isSupported) {
                        $('#aspectsList').append($('<option>' + res.aspect + '</option>'));
                    }
                };
                devicestatusService.isSupported(aspect, null, successCB);
            }
        }

        function loadComponents(components) {
            $('#componentsList').empty();
            for (var i = 0; i < components.length; i++) {
                $('#componentsList').append($('<option>' + components[i] + '</option>'));
            }
        }

        function loadProperties(aspect) {
            $('#propertiesList').empty();
            var property;
            for (var propertyIndex in vocabulary[aspect].Properties) {
                property = vocabulary[aspect].Properties[propertyIndex];
                var successCB = function (res) {
                    if (res.isSupported) {
                        $('#propertiesList').append($('<option>' + res.property + '</option>'));
                    }
                };
                devicestatusService.isSupported(aspect, property, successCB);
            }
        }
    }
);
