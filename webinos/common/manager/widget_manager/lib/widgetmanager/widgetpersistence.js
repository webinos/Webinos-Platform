/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

this.WidgetPersistence = (function() {
	var fs = require('fs');
	var path = require('path');

	var asciiEscape = function(str) {
		var result = '';
		for(var i in str) {
			var c = str.charCodeAt(i);
			if(c < 0x20 || c > 0x7f)
				result += escape(str[i]);
			else
				result += str[i];
		}
		return result;
	};

	/* get the type of a serializer path element
	 * 0 = object, 1 = array, 2 = function, 3 = string, 4 = number, 5 = boolean */
	var getElementType = function(serializer) {
		var type = typeof(serializer);
		if(type == 'function')
			return 2;
		if(type == 'object')
			return (Object.prototype.toString.call(serializer) == '[object Array]') ? 1 : 0;
		if(type == 'string') {
			if(serializer == 'string')
				return 3;
			if(serializer == 'number')
				return 4;
			if(serializer == 'boolean')
				return 5;
		}
	};

	var createContainer = function(element, elementType) {
		var container;
		switch(elementType) {
		case 0: /* object */
			container = {};
			break;
		case 1: /* array */
			container = [];
			break;
		case 2: /* function */
			container = new element();
			break;
		default:
		}
		return container;
	};
	
	var getEnumerator = function(element, elementType) {
		return (elementType == 2 /* function */) ? element.serialize : element;
	};

	var readPropertiesFile = function(file, prefix, serializer) {
		var serializerType = getElementType(serializer);
		var container = createContainer(serializer, serializerType);

		prefix += '.';
		var prefixLen = prefix.length;
		var lines = fs.readFileSync(file, 'utf-8').split('\n');
		for(var i in lines) {
			var line = lines[i].trim();
			if(line.length==0 || line[0]=='#')
				continue;
			if(line.substr(0, prefixLen) != prefix)
				continue;
			line = line.substr(prefixLen);
			try {
				var colon = line.indexOf(':');
				if(colon == -1)
					continue;
				var key = line.substr(0, colon),
				    value = unescape(line.substr(colon + 1)).trim(),
				    keyElements = key.split('.'),
				    target = container,
				    element = serializer,
				    elementType = serializerType,
				    prop;

				while(true) {
					element = getEnumerator(element, elementType);
					prop = keyElements.shift();
					var elementProp = (elementType == 1 /* array */) ? 0 : prop;
					if(!(elementProp in element)) {
						/* silently ignore for now values that are not in the serializer */
						throw new Error('Unable to process properties file entry: property not in schema: ' + elementProp + ' (' + key + '), elementTpe = ' + elementType);
					}
					element = element[elementProp];
					elementType = getElementType(element);
					if(!keyElements.length)
						break;
					if(!(prop in target)) {
						target[prop] = createContainer(element, elementType);
					}
					target = target[prop];
				}
				switch(elementType) {
				default: /* unsupported */
				case 0: /* object */
				case 1: /* array */
				case 2: /* function */
					/* all unexpected as terminal, ignore */
					break;
				case 3: /* string */
					target[prop] = value;
					break;
				case 4: /* number */
					target[prop] = Number(value);
					break;
				case 5: /* boolean */
					target[prop] = (value == 'true');
					break;
				}
			} catch(e) {
				console.log('WidgetPersistence.readPropertiesFile: skipping line: ' + line);
				console.log('Exception: ' + e);
			}
		}
		return container;
	};

	var writeObject = function(fd, object, prefix, serializer) {
		for(var i in serializer) {
			if(object[i] === undefined) continue;
			writeValue(fd, object[i], (prefix + '.' + i), serializer[i]);
		}
	};

	var writeArray = function(fd, array, prefix, serializer) {
		var len = array.length;
		fs.writeSync(fd, (prefix + '.length: ' + len + '\n'));
		for(var i = 0; i < len; i++)
			writeValue(fd, array[i], (prefix + '.' + i), serializer[0]);
	};

	var writeValue = function(fd, value, prefix, serializer) {
		if(typeof(value) == 'undefined')
			return;
		var eltType = getElementType(serializer);
		if(eltType == 2) {
			serializer = serializer.serialize;
			eltType = getElementType(serializer);
		}
		var valueStr;
		switch(eltType) {
		default: /* unsupported */	
			return;
		case 0: /* object */
			writeObject(fd, value, prefix, serializer);
			return;
		case 1: /* array */
			writeArray(fd, value, prefix, serializer);
			return;
		case 3: /* string */
			valueStr = asciiEscape(value);
			break;
		case 4: /* number */
			valueStr = Number(value).toString();
			break;
		case 5: /* boolean */
			valueStr = Boolean(value).toString();
			break;
		}
		fs.writeSync(fd, (prefix + ': ' + valueStr + '\n'));
	};

	var writePropertiesFile = function(file, container, prefix, serializer) {
		var fd = fs.openSync(file, 'w');
		writeValue(fd, container, prefix, serializer);
		fs.closeSync(fd);
	};

	/* private static functions */
	var readWidgetConfig = function(storage, item) {
		return readPropertiesFile(storage.getMetaFile(item, WidgetStorage.CONFIG_FILE), 'widget', WidgetConfig);
	};

	var readWidgetPreferences = function(storage, item, widgetConfig) {
		widgetConfig.preferences = readPropertiesFile(storage.getMetaFile(item, WidgetStorage.PREFERENCES_FILE), 'preference', [Preference]);
	};

	var readWidgetFeatures = function(storage, item, widgetConfig) {
		widgetConfig.features = readPropertiesFile(storage.getMetaFile(item, WidgetStorage.FEATURES_FILE), 'feature', [FeatureRequest]);
	};

	var readWidgetWarp = function(storage, item, widgetConfig) {
		widgetConfig.accessRequests = readPropertiesFile(storage.getMetaFile(item, WidgetStorage.WARP_FILE), 'access', [AccessRequest]);
	};

	var writeWidgetConfig = function(storage, item, widgetConfig) {
		writePropertiesFile(storage.getMetaFile(item, WidgetStorage.CONFIG_FILE), widgetConfig, 'widget', WidgetConfig);
	};

	var writeWidgetPreferences = function(storage, item, widgetConfig) {
		if(widgetConfig.preferences && widgetConfig.preferences.length)
			writePropertiesFile(storage.getMetaFile(item, WidgetStorage.PREFERENCES_FILE), widgetConfig.preferences, 'preference', [Preference]);
	};

	var writeWidgetFeatures = function(storage, item, widgetConfig) {
		if(widgetConfig.features && widgetConfig.features.length)
			writePropertiesFile(storage.getMetaFile(item, WidgetStorage.FEATURES_FILE), widgetConfig.features, 'feature', [FeatureRequest]);
	};

	var writeWidgetWarp = function(storage, item, widgetConfig) {
		if(widgetConfig.accessRequests && widgetConfig.accessRequests.length)
			writePropertiesFile(storage.getMetaFile(item, WidgetStorage.WARP_FILE), widgetConfig.accessRequests, 'access', [AccessRequest]);
	};

	/* public constructor */
	function WidgetPersistence() {}

	/* public static functions */
	WidgetPersistence.readWidgetMetadata = function(storage, item) {
		try {
			var widgetConfig = readWidgetConfig(storage, item);
			readWidgetPreferences(storage, item, widgetConfig);
			readWidgetFeatures(storage, item, widgetConfig);
			readWidgetWarp(storage, item, widgetConfig);
			return widgetConfig;
		} catch(e) {
			console.log(e);
		}
	};

	/* public static functions */
	WidgetPersistence.writeWidgetMetadata = function(storage, item, widgetConfig) {
		writeWidgetConfig(storage, item, widgetConfig);
		writeWidgetPreferences(storage, item, widgetConfig);
		writeWidgetFeatures(storage, item, widgetConfig);
		writeWidgetWarp(storage, item, widgetConfig);
	};

	WidgetPersistence.readWidgetPolicy = function(storage, item) {
		return readPropertiesFile(storage.getMetaFile(item, WidgetStorage.POLICY_FILE), 'signature', ValidationResult);
	};

	WidgetPersistence.writeWidgetPolicy = function(storage, item, widgetConfig, validationResult) {
		writePropertiesFile(storage.getMetaFile(item, WidgetStorage.POLICY_FILE), validationResult, 'signature', ValidationResult);
	};

	WidgetPersistence.extractWidget = function(storage, item, resource, map) {
		/* copy the widget file */
		var wgtFile = storage.getMetaFile(item, WidgetStorage.WGT_FILE);
		ManagerUtils.copyFile(resource.getResource(), wgtFile, true);

		/* extract to the install dir */
		var wgtDir = storage.getWidgetDir(item);
		var resFiles = resource.list();
		for(var resEntry in resFiles) {
			/* get mapped source name for each default file */
			if(!LocalisedFileMapping.isLocaleFile(resEntry)) {
				WidgetPersistence.extractFile(wgtDir, resource, map, resEntry);
			}
		}
	};

	WidgetPersistence.extractFile = function(wgtDir, resource, map, entry) {
		var buf = resource.readFileSync(map.map(entry));
		var dest = path.resolve(wgtDir, entry);
		ManagerUtils.mkdirs(path.dirname(dest));
		fs.writeFileSync(dest, buf);
	};

	return WidgetPersistence;
})();
