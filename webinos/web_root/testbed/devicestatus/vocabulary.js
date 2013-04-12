var vocabulary = {
	Battery:{
		Properties:	[ "batteryLevel"
				, "batteryBeingCharged"
				],
		Components:	[ "_default" ]
	},
	Camera:{
		Properties:	[ "model"
				, "vendor"
				, "status"
				, "resolutionHeight"
				, "resolutionWidth"
				, "maxZoom"
				, "minZoom"
				, "currentZoom"
				, "hasFlash"
				, "flashOn"
				],
		Components:	[ "_active"
				, "_default"
				]
	},
	CellularHardware:{
		Properties:	[ "status" ],
		Components:	[ "_default" ]
	},
	CellularNetwork:{
		Properties:	[ "isInRoaming"
				, "mcc"
				, "mnc"
				, "signalStrength"
				, "operatorName"
				, "ipAddress"
				, "macAddress"
				],
		Components:	[ "_default" ]
	},
	CPU:{
		Properties:	[ "model"
				, "currentLoad"
				],
		Components:	[ "_default" ]
	},
	Device:{
		Properties:	[ "imei"
				, "model"
				, "version"
				, "vendor"
				, "type"
				],
		Components:	[ "_default" ]
	},
	Display:{
		Properties:	[ "resolutionHeight"
				, "pixelAspectRatio"
				, "dpiY"
				, "resolutionWidth"
				, "dpiX"
				, "colorDepth"
				],
		Components:	[ "_active"
				, "_default"
				]
	},
	InputDevice:{
		Properties:	[ "type" ],
		Components:	[ "_default" ]
	},
	MemoryUnit:{
		Properties:	[ "size"
				, "removable"
				, "availableSize"
				, "volatile"
				],
		Components:	[ "_default" ]
	},
	OperatingSystem:{
		Properties:	[ "language"
				, "version"
				, "name"
				, "vendor"
				],
		Components:	[ "_active"
				, "_default"
				]
	},
	ParentalRating:{
		Properties:	[ "name"
				, "scheme"
				, "region"
				],
		Components:	[ "_default" ]
	},
	WebRuntime:{
		Properties:	[ "wacVersion"
				, "supportedImageFormats"
				, "version"
				, "name"
				, "vendor"
				, "webinosVersion"
				],
		Components:	[ "_active"
				, "_default" ]
	},
	WiFiHardware:{
		Properties:	[ "status" ],
		Components:	[ "_default" ]
	},
	WiFiNetwork:{
		Properties:	[ "ssid"
				, "signalStrength"
				, "networkStatus"
				, "ipAddress"
				, "macAddress"
				],
		Components:	[ "_active"
				, "_default" ]
	},
	WiredNetwork:{
		Properties:	[ "networkStatus"
				, "ipAddress"
				, "macAddress"
				],
		Components:	[ "_active"
				, "_default" ]
	}
};
