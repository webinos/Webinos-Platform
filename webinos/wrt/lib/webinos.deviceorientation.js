(function() {

WebinosDeviceOrientation = function (obj) {
	this.base = WebinosService;
	this.base(obj);
};

var _referenceMappingDo = new Array();
var _eventIdsDo = new Array('deviceorientation', 'compassneedscalibration', 'devicemotion');

WebinosDeviceOrientation.prototype = new WebinosService;

WebinosDeviceOrientation.prototype.bindService = function (bindCB, serviceId) {
	// actually there should be an auth check here or whatever, but we just always bind
	this.addEventListener = addEventListener;
	this.removeEventListener = removeEventListener;
	this.dispatchEvent = dispatchEvent;
	
    //Objects
    this.DeviceOrientationEvent = DeviceOrientationEvent;
    this.DeviceMotionEvent = DeviceMotionEvent;
    this.Acceleration = Acceleration;
    this.RotationRate = RotationRate;
    
    
    
    
	if (typeof bindCB.onBind === 'function') {
		bindCB.onBind(this);
	};
}

function addEventListener(type, listener, useCapture) {
    
    if(_eventIdsDo.indexOf(type) != -1){	
    
            console.log("LISTENER"+ listener);
    
			var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", [type, listener, useCapture]);
			_referenceMappingDo.push([rpc.id, listener]);

			console.log('# of references' + _referenceMappingDo.length);	
			rpc.onEvent = function (orientationEvent) {
				listener(orientationEvent);
			};
            
			webinos.rpcHandler.registerCallbackObject(rpc);
			webinos.rpcHandler.executeRPC(rpc);
		}else{
			console.log(type + ' not found');	
		}
};

//DEFINITION BASE EVENT
WDomEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
	this.initEvent(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp);
}

WDomEvent.prototype.speed = 0;

WDomEvent.prototype.initEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp){
    this.type = type;
    this.target = target;
    this.currentTarget = currentTarget;
    this.eventPhase = eventPhase;
    this.bubbles = bubbles;
    this.cancelable  = cancelable;
    this.timestamp = timestamp; 
}


DeviceOrientationEvent = function(alpha, beta, gamma){
	this.initDeviceOrientationEvent(alpha, beta, gamma);
}

DeviceOrientationEvent.prototype = new WDomEvent();
DeviceOrientationEvent.prototype.constructor = DeviceOrientationEvent;
DeviceOrientationEvent.parent = WDomEvent.prototype; // our "super" property

DeviceOrientationEvent.prototype.initDeviceOrientationEvent = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
    
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    
	DeviceOrientationEvent.parent.initEvent.call(this,'deviceorientation', null, null, null, false, false, stamp);
}
Acceleration = function(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z;
}
RotationRate = function(alpha, beta, gamma){
	this.alpha = alpha;
	this.beta = beta;
	this.gamma = gamma;
}
DeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval){
	this.initDeviceMotionEvent(acceleration, accelerationIncludingGravity, rotationRate, interval);
}
DeviceMotionEvent.prototype = new WDomEvent();
DeviceMotionEvent.prototype.constructor = DeviceOrientationEvent;
DeviceMotionEvent.parent = WDomEvent.prototype; // our "super" property

DeviceMotionEvent.prototype.initDeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval){
	this.acceleration = acceleration;
	this.accelerationIncludingGravity = accelerationIncludingGravity;
	this.rotationRate = rotationRate;
	this.interval = interval;
    var d = new Date();
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
	DeviceOrientationEvent.parent.initEvent.call(this,'devicemotion', null, null, null, false, false, stamp);
}

function removeEventListener(type, listener, useCapture) {
        console.log("LISTENER"+ listener);
        var refToBeDeleted = null;
		for(var i = 0; i < _referenceMappingDo.length; i++){
			console.log("Reference" + i + ": " + _referenceMappingDo[i][0]);
			console.log("Handler" + i + ": " + _referenceMappingDo[i][1]);
			if(_referenceMappingDo[i][1] == listener){
					var arguments = new Array();
					arguments[0] = _referenceMappingDo[i][0];
					arguments[1] = type;
					console.log("ListenerObject to be removed ref#" + _referenceMappingDo[i][0]);                                             
                    var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
					webinos.rpcHandler.executeRPC(rpc,
						function(result){
							callOnSuccess(result);
						},
						function(error){
							callOnError(error);
						}
					);
					break;			
			}	
    }
};

function dispatchEvent(event) {
    //TODO
};

})();