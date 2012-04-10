/**
 * TODO On webinos update event, add new shard(s) and update the current page.
 * TODO Check various "inline" TODOs.
 */

	en = null;
	ev = null;
	paintPlayers = null;
	lastTime = 0;
(function (exports) {
	"use strict";

	//ADAPT THIS TO YOUR MACHINE!
	var playerApp = "C:\\Users\\apa\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
	var startOptions = "\"http://192.168.2.113:8080/client/webinosFS/player.html?id=1&name=MyTV\" --kiosk --new-window";
	
	
	var browse = {},
		select = {},
		view = {},
		remote = {};

	exports.state = "browse";

	// TODO Check token on push and clear tasks array on clear.
	exports.queue = async.queue(function (data, callback) {
		try {
			if (data.token >= exports.queue.token)
				data.fun();
		} finally {
			callback();
		}
	}, 1);

	exports.queue.token = 0;
	exports.queue.clear = function () {
		exports.queue.token++;
	};

	exports.shards = [];
	exports.shards.add = function (shard) {
		var newLength = this.push(shard);

		$(exports).triggerHandler("add.shard", [shard, newLength - 1, this]);
	};

	$(exports).on("add.shard", function (event, shard) {
		if (exports.state == "browse")
			shard.browse(exports.browse.path, exports.queue.token);
	});

	exports.Shard = function (service, filesystem) {
		this.service = service;
		this.filesystem = filesystem;
	};

	exports.Shard.prototype.browse = function (path, token) {
		var shard = this;

		this.filesystem.root.getDirectory(path, { create: false }, function (entry) {
			var reader = entry.createReader();

			var successCallback = function (entries) {
				if (entries.length == 0)
					return;

				exports.queue.push({
					token: token,
					fun: function () {
						entries.forEach(function (entry) {
							var sentry;

							if (entry.isFile)
								sentry = new exports.FileSentry(entry.fullPath);
							else if (entry.isDirectory)
								sentry = new exports.DirectorySentry(entry.fullPath);

							sentry.shards.add(shard, entry);

							exports.browse.sentries.add(sentry);
						});
					}
				});

				reader.readEntries(successCallback);
			};

			reader.readEntries(successCallback);
		});
	};

	exports.Sentry = function (fullPath) {
		this.shards = [];
		this.shards.add = function (shard, entry) {
			this.push({ shard: shard, entry: entry });
		};

		this.name = webinos.path.basename(fullPath);
		this.fullPath = fullPath;

		this.$html = this.htmlify();
	};

	exports.Sentry.prototype.isFile = false;
	exports.Sentry.prototype.isDirectory = false;

	exports.DirectorySentry = function (fullPath) {
		exports.Sentry.call(this, fullPath);
	};

	webinos.utils.inherits(exports.DirectorySentry, exports.Sentry);

	exports.DirectorySentry.prototype.isDirectory = true;
	exports.DirectorySentry.prototype.htmlify = function () {
		var $html = $('<li class="directory"><a href="#browse?' + $.param({
				path: this.fullPath
			}) + '">' + this.name + '</a></li>');

		$html.jqmData("sentry", this);

		return $html;
	};

	exports.FileSentry = function (fullPath) {
		exports.Sentry.call(this, fullPath);
	};

	webinos.utils.inherits(exports.FileSentry, exports.Sentry);

	exports.FileSentry.prototype.isFile = true;
	exports.FileSentry.prototype.htmlify = function () {
		var $html = $('<li class="file"><a href="#select?' + $.param({
				path: this.fullPath
			}) + '">' + this.name + '</a></li>');

		$html.jqmData("sentry", this);

		return $html;
	};

	exports.browse = function (path, changePage, options) {
		exports.state = "browse";
		exports.queue.clear();

		exports.browse.path = path;
		exports.browse.sentries.clear();

		exports.shards.forEach(function (shard) {
			shard.browse(exports.browse.path, exports.queue.token);
		});

		if (changePage) {
			var defaultOptions = {
				allowSamePageTransition: true,
				transition: "none"
			};

			$.mobile.changePage("#browse", $.extend(defaultOptions, options));
		}

		$(exports).triggerHandler("browse", path);
	};

	$(exports).on("browse", function (event, path) {
		if (path == "/")
			browse.$parent.hide();
		else
			browse.$parent.show();

		browse.$current.text(webinos.path.basename(path) || "webinosFS");
	});

	exports.browse.path = "/";
	exports.browse.sentries = [];
	exports.browse.sentries.add = function (sentry) {
		var i;
		for (i = 0; i < this.length; i++)
			if (this[i].fullPath == sentry.fullPath && (this[i].isFile && sentry.isFile || this[i].isDirectory && sentry.isDirectory)) {
				sentry.shards.forEach(function (shard) {
					this[i].shards.add(shard.shard, shard.entry);
				});

				return;
			} else if (this[i].fullPath > sentry.fullPath)
				break;

		this.splice(i, 0, sentry);

		$(exports).triggerHandler("add.sentry", [sentry, i, this]);
	};

	$(exports).on("add.sentry", function (event, sentry, i, sentries) {
		if (i == 0)
			sentry.$html.prependTo(browse.$sentries);
		else
			sentry.$html.insertAfter(sentries[i - 1].$html);

		browse.$sentries.listview("refresh");
	});

	exports.browse.sentries.clear = function () {
		this.splice(0, this.length);

		$(exports).triggerHandler("clear.sentry");
	};

	$(exports).on("clear.sentry", function (event) {
		browse.$sentries.empty();
	});

	exports.select = function (sentry) {
		exports.state = "select";
		exports.queue.clear();

		exports.select.sentry = sentry;

		$.mobile.changePage("#select", { changeHash: false });

		$(exports).triggerHandler("select", sentry);
	};

	$(exports).on("select", function (event, sentry) {
		select.$name.text(sentry.name);

		select.$shards.empty();

		sentry.shards.forEach(function (shard) {
			var $html = $('<li class="shard"><a href="#view?' + $.param({
					shard: shard.shard.service.serviceAddress,
					path: sentry.fullPath
				}) + '">' + shard.shard.service.serviceAddress + '</a></li>');

			$html.jqmData("entry", shard.entry);

			$html.appendTo(select.$shards);
		});

		select.$shards.listview("refresh");
	});

	exports.view = function (entry) {
		exports.state = "view";
		exports.queue.clear();

		exports.view.entry = entry;

		$.mobile.changePage("#view", { changeHash: false });

		$(exports).triggerHandler("view", entry);
	};

	$(exports).on("view", function (event, entry) {
		view.$name.text(entry.name);

		var extname = webinos.path.extname(entry.name);
		var $html;

		switch (extname) {
			case ".mp3":
			case ".m4a":
			case ".ogg":
				$html = $('<center><audio id ="player" src="' + entry.toURL().substring(8) + '" controls></audio></center>');
				break;
			case ".ogv":
			case ".webm":
			case ".m4v":
			case ".mp4":
				$html = $('<center><video id ="player"  src="' + entry.toURL().substring(8) + '" controls></video></center>');
				break;
		}

		$html.appendTo(view.$content);
	});

	exports.remote = function (entry) {
		exports.state = "remote";
		exports.queue.clear();

		exports.remote.entry = entry;

		$.mobile.changePage("#remote", { changeHash: false });

		$(exports).triggerHandler("remote", entry);
	};

	exports.remote.players = [];
	exports.remote.players.add = function (player) {
		for (var i = 0; i < this.length; i++)
			if (this[i].id == player.id)
				return;

		this.push(player);
	};

	exports.remote.playing = undefined;
	exports.remote.play = function (player, entry) {
		
		
		
		if (typeof exports.remote.playing !== "undefined") {
			var clear = exports.events.service.createWebinosEvent("clear", {
				type: "player",
				id: exports.remote.playing.player.id
			});

			clear.dispatchWebinosEvent();
		}
		
		exports.remote.playing = {
			player: player,
			entry: entry
		};
		
		var init = exports.events.service.createWebinosEvent("init", {
			type: "player",
			id: player.id,
		}, {
			name: entry.name,
			url: entry.toURL(),
			time: lastTime
		});

		init.dispatchWebinosEvent();
		
		exports.browse(webinos.path.dirname(entry.fullPath), true, {
			transition: "slide",
			reverse: true
		});
	};


	
	$(exports).on("remote", function (event, entry) {


		
		if (exports.remote.players.length < 1){
			var appID = playerApp;
        	var startParams = [];
        	startParams.push(startOptions);
			
        	remote.$name.text(entry.name);
        	en = entry;
        	ev = event;
        	paintPlayers = paintPlayerList;
        	for (var i=0; i<exports.applauncher.services.length; i++) {
        		exports.applauncher.services[i].launchApplication(
        				function (){
        					//$('#messages').append('<li> App launched </li>');
        					console.log("Player App Launched");
        					//setTimeout("paintPlayers(ev, en)",5000);
        				},
        				function (){
        					//$('#messages').append('<li> Error while launching App</li>');
        					console.log("Error while launching Player App");
        				},
        				appID,
        				startParams
        		);
        	}
			
		}
		else {
			paintPlayerList(event, entry, true);
		}
		

	});
	
	var paintPlayerList = function (event, entry, mode) {
		console.log("Painting Player List");
		
		
		remote.$name.text(entry.name);

		
		remote.$players.empty();
		
		exports.remote.players.forEach(function (player) {
			var $html = $('<li class="player"><a href="#play?' + $.param({
					player: player.id,
					path: entry.fullPath
				}) + '">' + player.name + '</a></li>');

			$html.jqmData("player", player);
			$html.jqmData("entry", entry);

			$html.appendTo(remote.$players);
		});

		remote.$players.listview("refresh");
	}

	exports.events = {};
	exports.events.service = undefined;
	exports.events.handler = function (event) {
		if (event.addressing.type != "browser")
			return;
		
		switch (event.type) {
			case "hello":
				
				var currentSecs = new Date().getTime();
				
				var i;
				var pl;
				var known = false;
				for (i = 0; i < exports.remote.players.length; i++){
					pl = exports.remote.players[i];
					
					if (pl.id == event.payload.id){
						pl.time = currentSecs;
						known = true;
					}
				}
				
				if (!known){
					exports.remote.players.add({
						id: event.payload.id,
						name: event.payload.name,
						time: currentSecs
					});
				
				
					paintPlayers(ev, en, true);
				}
				break;
			case "play":
				if (event.payload.id == exports.remote.playing.player.id) {
					var $pause = $('<a>Pause</a>');
					$pause.click(function () {
						var pause = exports.events.service.createWebinosEvent("pause", {
							type: "player",
							id: event.payload.id
						});
	
						pause.dispatchWebinosEvent();
					});

					browse.$playing.html(exports.remote.playing.entry.name + ' @ ' + exports.remote.playing.player.name + ' <br>Time: <span id="timer">' + Math.floor(event.payload.time) + '/' +  Math.floor(event.payload.duration) + '</span> ');
					browse.$playing.append($pause);
					
					$pause.button();
				}
				
				break;
				
			case "pause":
				if (event.payload.id == exports.remote.playing.player.id) {
					var $play = $('<a>Play</a>');
					$play.click(function () {
						var play = exports.events.service.createWebinosEvent("play", {
							type: "player",
							id: event.payload.id
						});
	
						play.dispatchWebinosEvent();
					});

					browse.$playing.html(exports.remote.playing.entry.name + ' @ ' + exports.remote.playing.player.name + ' <br>Time: <span id="timer">' + Math.floor(event.payload.time) + '/' +  Math.floor(event.payload.duration) + '</span> ');
					browse.$playing.append($play);
					
					$play.button();
				}
				
				break;
				
			case "status":
				if (event.payload.id == exports.remote.playing.player.id) {
					$("#timer").html(Math.floor(event.payload.time) + '/' +  Math.floor(event.payload.duration));
				}
				
				break;
		}
	};
	
	
	exports.applauncher = {};
	exports.applauncher.services = [];

	$(document).ready(function () {
		browse.$page = $("#browse");
		browse.$header = $("div:jqmData(role='header')", browse.$page);
		browse.$content = $("div:jqmData(role='content')", browse.$page);
		browse.$footer = $("div:jqmData(role='footer')", browse.$page);

		browse.$parent = $("#parent\\.browse", browse.$header);
		browse.$parent.click(function (event) {
			exports.browse(webinos.path.dirname(exports.browse.path));

			return false;
		});

		browse.$current = $("#current\\.browse", browse.$header);
		browse.$refresh = $("#refresh\\.browse", browse.$header);
		browse.$refresh.click(function (event) {
			exports.browse(exports.browse.path);

			return false;
		});

		browse.$sentries = $("#sentries\\.browse", browse.$content);
		browse.$sentries.on("click", ".directory", function (event) {
			var sentry = $(this).jqmData("sentry");

			exports.browse(sentry.fullPath);

			return false;
		});

		browse.$sentries.on("click", ".file", function (event) {
			var sentry = $(this).jqmData("sentry");

			if (sentry.shards.length > 1)
				exports.select(sentry);
			else
				exports.view(sentry.shards[0].entry);

			return false;
		});
		
		browse.$playing = $("#playing\\.browse", browse.$footer);

		select.$page = $("#select");
		select.$header = $("div:jqmData(role='header')", select.$page);
		select.$content = $("div:jqmData(role='content')", select.$page);

		select.$parent = $("#parent\\.select", select.$header);
		select.$parent.click(function (event) {
			exports.browse(webinos.path.dirname(exports.select.sentry.fullPath), true, {
				transition: "slide",
				reverse: true
			});

			return false;
		});

		select.$name = $("#name\\.select", select.$header);

		select.$shards = $("#shards\\.select", select.$content);
		select.$shards.on("click", ".shard", function (event) {
			var entry = $(this).jqmData("entry");

			exports.view(entry);

			return false;
		});

		view.$page = $("#view");
		view.$page.on("pagehide", function (event) {
			lastTime = $("#player")[0].currentTime;
			
			console.log("Set lastTime to " + lastTime); 
			
			
			view.$content.empty();
		});

		view.$header = $("div:jqmData(role='header')", view.$page);
		view.$content = $("div:jqmData(role='content')", view.$page);
		view.$footer = $("div:jqmData(role='footer')", view.$page);

		view.$parent = $("#parent\\.view", view.$header);
		view.$parent.click(function (event) {
			exports.browse(webinos.path.dirname(exports.view.entry.fullPath), true, {
				transition: "slide",
				reverse: true
			});

			return false;
		});

		view.$name = $("#name\\.view", view.$header);

		view.$remote = $("#remote\\.view", view.$footer);
		view.$remote.click(function (event) {
			exports.remote(exports.view.entry);

			return false;
		});

		remote.$page = $("#remote");

		remote.$header = $("div:jqmData(role='header')", remote.$page);
		remote.$content = $("div:jqmData(role='content')", remote.$page);

		remote.$view = $("#view\\.remote", remote.$header);
		remote.$view.click(function (event) {
			exports.view(exports.remote.entry);

			return false;
		});

		remote.$name = $("#name\\.remote", remote.$header);

		remote.$players = $("#players\\.remote", remote.$content);
		remote.$players.on("click", ".player", function (event) {
			var player = $(this).jqmData("player"),
				entry = $(this).jqmData("entry");

			exports.remote.play(player, entry);

			return false;
		});
	});

	webinos.session.addListener("registeredBrowser", function (event) {
		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/events"), {
			onFound: function (service) {
				exports.events.service = service;

	    		service.bind(function () {
	    			service.addWebinosEventListener(exports.events.handler);
	    			
	    			
	    			
	    			var hello = service.createWebinosEvent("hello", {
	    				type: "player"
	    			}, {
	    				type: "browser"
	    			});
	    			
	    			hello.dispatchWebinosEvent();
	    			
	    			
	    			window.setInterval(function () { 
	    				
	    				console.log("Checking players. Available: " + exports.remote.players.length);
	    				
	    				var hello = service.createWebinosEvent("hello", {
		    				type: "player"
		    			}, {
		    				type: "browser"
		    			});
		    			
		    			hello.dispatchWebinosEvent();
	    				
		    			
		    			//ceck player timeouts
		    			
		    			var i;
		    			var pl;
		    			var cur = new Date().getTime();
						for (i = 0; i < exports.remote.players.length; i++){
							pl = exports.remote.players[i];
							
							if (typeof pl === 'undefined') continue;
							if (typeof pl.time === 'undefined') continue;
							
							if (cur - pl.time > 10000){
								console.log("Deleted player "  + pl.id + " " + pl.name);
								
								exports.remote.players.splice(i);
								//delete exports.remote.players[i];
								paintPlayers(ev, en, false);
							}
						}
	    				
	    				
	    			}, 5000);
	    			
	    			
	    		});
	    	}
		});

		// TODO Fix pseudo-sequentialization of service discovery.
		setTimeout(function () {
			webinos.discovery.findServices(new ServiceType("http://webinos.org/api/file"), {
				onFound: function (service) {
					$(exports).triggerHandler("service.found", service);
				}
			});
		}, 250);
		
		
		 webinos.discovery.findServices(new ServiceType('http://webinos.org/api/applauncher'), 
					{onFound: function (service) {
						exports.applauncher.services.push(service);
         	    }});
		
		
	});

	$(exports).on("service.found", function (event, service) {
		service.bindService({
			onBind: function () {
				$(exports).triggerHandler("service.bound", service);
			}
		});
	});

	$(exports).on("service.bound", function (event, service) {
		service.requestFileSystem(webinos.file.LocalFileSystem.PERSISTENT, 0, function (filesystem) {
			exports.shards.add(new exports.Shard(service, filesystem));
		});
	});

//	$(document).on("pagebeforechange", function (event, data) {
//		if (typeof data.toPage === "string") {
//			var operation = "browse";
//
//			var url = $.mobile.path.parseUrl(data.toPage);
//			var matches = url.hash.match(/^#([^\?]+)(?:\?.*)?$/);
//
//			if (matches !== null)
//				operation = matches[1];
//
//			if (operation == "browse") {
//				data.options.allowSamePageTransition = true;
//
//				switch (exports.state) {
//					case "browse":
//						data.options.transition = "none";
//						break;
//					case "view":
//						data.options.reverse = true;
//						break;
//				}
//			}
//		}
//	});

//	$(document).on("pageshow", function (event, data) {
//		var operation = "browse",
//			params = { path: "/" };
//
//		var url = $.mobile.path.parseUrl(window.location.href);
//		var matches = url.hash.match(/^#([^\?]+)(?:\?(.*))?$/);
//
//		if (matches !== null) {
//			operation = matches[1];
//
//			if (typeof matches[2] !== "undefined")
//				$.extend(params, $.deparam(matches[2]));
//		}
//
//		switch (operation) {
//			case "browse":
//				return exports.browse(params.path);
//			case "view":
//				return exports.view(params.path);
//		}
//	});
})(webinosFS = {});
