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
 * Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
 ******************************************************************************/
(function() {
	var _sync = new SyncManager({
		"api": "http://webinsdf/sync",
		"name": "sync",
		"id": "foo"
	});

	webinos.__defineGetter__('sync', function() {
		return _sync;
	});

	/**
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	function SyncManager(obj) {
		this.base = WebinosService;
		this.base(obj);

		var _app2app;
		var _chanMap = {};
		var _watchMap = {};

		var that = this;
		var _callerCache = [];
		var finishCallers = function() {
			for (var i = 0; i < _callerCache.length; i++) {
				var caller = _callerCache[i];
				webinos.sync[caller.func].apply(that, caller.params);
			}
			_callerCache = [];
		};

		webinos.discovery.findServices({"api": "http://webinos.org/api/app2app"}, {
			onFound: function (unboundService) {
				_app2app = unboundService; // FIXME should be assigned on bind
				unboundService.bindService({onBind: function(sv) {
					finishCallers();
				}});
			}
		});

		this.create = function (id, successCallback, errorCallback, options) {
			if (!_app2app) {
				_callerCache.push({
					"func": "create",
					"params": [id, successCallback, errorCallback, options]
				});
				return;
			}

			var messageCallback = function (msg) {
				console.log("got appstate sync msg");
				var scb = _watchMap[msg.contents[0]+msg.contents[1]];
				if (scb) {
					scb({
						"propertyPath": msg.contents[1],
						"previousValue": msg.contents[3],
						"currentValue": msg.contents[2]
					});
				}
			};

			var creatSyOb = function(c, connect, searchOp) {
				if (searchOp) searchOp.cancel();

				var chan = _chanMap[id];
				if (chan) chan.ref++;
				
				_chanMap[id] = chan ? chan : {"chan": c, "ref": 0};
				var so = options && options.referenceObject ?
						new SyncObject(id, options.referenceObject) : new SyncObject(id);

				if (connect) {
					c.connect({"source": id}, messageCallback, function() {
						successCallback(so);
					}, function(err) {
						errorCallback(err);
					});
				} else {
					successCallback(so);
				}
			};
			
			var search = function() {
				var op = _app2app.searchForChannels("urn:syncobj:" + id, [], function searchCallback(chan) {
					console.log("Found existing channel for sync obj");
					creatSyOb(chan, true, op);
				}, function succCallbackSearch() {
					
				}, function errCallbackSearch(err) {
					if (err.message === "There is already a search in progress.") {
						setTimeout(function() {
							search();
						}, 600);
					} else {
						if (errorCallback) errorCallback(err);
					}
				});
			};

			_app2app.createChannel({
				"namespace": "urn:syncobj:" + id,
				"properties": { "mode": "send-receive" },
				"appInfo": {}
			}, function requestCallback(req) {
				return true;
			},
			messageCallback, 
			function succCallbackCreate(chan) {
				creatSyOb(chan);
			}, function errCallbackCreate(err) {
				if (err.message === "Channel already exists.") {
					search();
				} else {
					if (errorCallback) errorCallback(err);
				}
			});
		};

		/**
		 */
		this.find = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "find",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

		};

		/**
		 */
		this.detach = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "detach",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

		};

		/**
		 */
		this.remove = function (id, successCallback, errorCallback) {
			if (!_app2app) {
				_callerCache.push({
					"func": "remove",
					"params": [id, successCallback, errorCallback]
				});
				return;
			}

			var chan = _chanMap[id];
			if (!chan) {
				if (errorCallback) errorCallback({"message": "couldn't remove, already removed?"});
				return;
			}
			chan.chan.disconnect();

			if (chan.ref > 0) chan.ref--;
			if (chan.ref === 0) delete _chanMap[id];

			successCallback();
		};

		function SyncObject(id, data) {
			var _id = id;
			var _data;
			this.data = {};

			var clone = function(obj) {
				if (obj == null || typeof(obj) != 'object')
					return obj;

				var temp = new obj.constructor();
				for (var key in obj)
					temp[key] = clone(obj[key]);

				return temp;
			};
			_data = clone(data);

			var get = function(prop) {
				return _data[prop];
			};
			var set = function(prop, val) {
				var chan = _chanMap[id];
				chan.chan.send([id, prop, val, _data[prop]]);
				_data[prop] = val;
			};
			var defineProp = function(prop) {
				Object.defineProperty(this.data, prop, {
					configurable: true,
					enumeable: true,
					writeable: true,
					get: function() {
						return get.call(this, prop);
					},
					set: function(val) {
						set.call(this, prop, val);
					}
				});
			};

			// use props from data as template for this object
			for (var prop in _data) {
				if (!prop) break;

				defineProp.call(this, prop);
			}

			var that = this;
			this.watch = function(prop, successCallback, errorCallback) {
				var chan = _chanMap[id];
				if (!chan) {
					errorCallback({message: 'not connected'});
					return;
				}
				_watchMap[id+prop] = successCallback;

				if (that.data[prop]) {
					_data[prop] = that.data[prop];
					delete that.data[prop];
				}
				defineProp.call(that, prop);
			};

			this.unwatch = function(prop, successCallback, errorCallback) {
				var chan = _chanMap[id];
				if (!chan) {
					errorCallback({message: 'not connected'});
					return;
				}

				delete _watchMap[id+prop];
			};
		}

	};

	SyncManager.prototype = new WebinosService;

}());