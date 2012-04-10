/*
 * Copyright © Atomic Inc 2007-2009
 * http://jsorm.com
 *
 * This file contains work that is copyrighted and is distributed under one of several licenses. 
 * You may not use, modify or distribute this work, except under an approved license. 
 * Please visit the Web site listed above to obtain the original work and a license.
 * 
 * These libraries contains work written and published by Douglas Crockford www.crockford.com. 
 * Page xii of "JavaScript: The Good Parts" ISBN 978-0-596-51774-8 explicitly states that
 * "writing a program that uses several chunks of code from this book does not require permission."
 * To use any code in these libraries that comes from that work requires reference to the original license.
 * 
 * Version: 1.3b
 */

JSORM={version:'1.3b'};Array.prototype.isArray=true;Array.prototype.pushAll=function(a){a=[].concat(a);Array.prototype.push.apply(this,a);};Array.prototype.insert=function(i,elm){Array.prototype.splice.apply(this,[].concat(i,0,elm));};Array.prototype.clear=function(){Array.prototype.splice.apply(this,[0]);};Array.prototype.replace=function(elm){this.clear();this.pushAll(elm);};Array.prototype.hasher=function(){var i,len,h={};for(i=0,len=this.length;i<len;i++){h[this[i]]=i;}
return(h);};Array.prototype.indexOf=function(elm){var i,len,found=false;for(i=0,len=this.length;i<len;i++){if(this[i]===elm){found=true;break;}}
return(found?i:-1);};Array.prototype.remove=function(elm){var i=this.indexOf(elm);if(i>=0){this.splice(i,1);}};JSORM.clear=function(o){var i;for(i in o){if(o.hasOwnProperty(i)&&typeof(i)!=="function"){delete o[i];}}};JSORM.apply=function(target,source,fields){source=source&&typeof(source)==="object"?source:{};fields=fields&&typeof(fields)==="object"?fields:source;target=target||{};for(var prp in fields){if(source.hasOwnProperty(prp)){target[prp]=source[prp];}}
return(target);};JSORM.common=function(a,b,keys){var i,c={};if(a&&typeof(a)==="object"&&b&&typeof(b)==="object"){for(i in a){if(typeof(a[i])!=="function"&&typeof(b[i])===typeof(a[i])&&(keys||a[i]===b[i])){c[i]=a[i];}}}
return(c);};JSORM.first=function(){var ret=null,i,len;for(i=0,len=arguments.length;i<len;i++){if(arguments[i]!==undefined){ret=arguments[i];break;}}
return(ret);};JSORM.compare=function(a,b){var ident=false,i,len,compare=JSORM.compare;if(a===b){return(true);}
else if(a.isArray&&b.isArray){len=a.length;if(len!=b.length){return(false);}
for(i=0;i<len;i++){if(!compare(a[i],b[i])){return(false);}}
return(true);}else if(typeof(a)=="object"&&typeof(b)=="object"){for(i in a){if(!compare(a[i],b[i])){return(false);}}
for(i in b){if(!compare(a[i],b[i])){return(false);}}
return(true);}else{return(false);}}
JSORM.clone=function(){var c=function(obj,deep){var newObj,prp,rec,type;if(typeof(obj)==="object"&&obj!==null){newObj=new obj.constructor();for(prp in obj){if(obj.hasOwnProperty(prp)&&(type=typeof(rec=obj[prp]))!=="function"){if(type==="object"&&deep){newObj[prp]=c(rec);}else{newObj[prp]=rec;}}}}else{newObj=obj;}
return(newObj);}
return(c);}();JSORM.iclone=function(obj,deep){var newObj,child,o,prp,rec,type,stack=[],newP=[],children;stack.push({o:obj,p:null});newP.push(new obj.constructor());while(stack.length>0){obj=stack[stack.length-1];if(!obj.hasOwnProperty("c")){children=[];o=obj.o;for(prp in o){if(o.hasOwnProperty(prp)&&(type=typeof(rec=o[prp]))!=="function"){if(type==="object"&&deep){children.push({o:rec,p:prp});}else{newP[newP.length-1][prp]=rec;}}}
obj.c=children;}
if(obj.c.length>0){child=obj.c.shift();stack.push(child);newP.push(new child.o.constructor());}else{stack.pop();newObj=newP.pop();if(stack.length>0){newP[newP.length-1][obj.p]=newObj;}}}
return(newObj);};JSORM.zeropad=function(n,l){var ret=n+'';var d=l-ret.length;if(d>0){for(var i=0;i<d;i++){ret='0'+ret;}}
return(ret);};JSORM.fork=function(){var fork,window=this,t;if(window&&window.setTimeout&&typeof(window.setTimeout)==="function"){fork=function(f){window.setTimeout(f,1);};}else if(java&&java.lang&&java.lang.Thread&&typeof(java.lang.Thread)==="function"){fork=function(f){t=new java.lang.Thread(new java.lang.Runnable({run:function(){f();}})).start();};}else{fork=null;}
return(fork?function(conf){var f=conf.fn,scope=conf.scope,arg=[].concat(conf.arg);fork(function(){f.apply(scope,arg);});}:fork);}();JSORM.ajax=function(arg){var url=arg.url,callback=arg.callback,scope=arg.scope,options=arg.options,xmlHttp;var method=arg.method||"GET",params=arg.params,pstr=null,i;try{xmlHttp=new window.XMLHttpRequest();}catch(e0){try{xmlHttp=new window.ActiveXObject("Msxml2.XMLHTTP");}catch(e1){try{xmlHttp=new window.ActiveXObject("Microsoft.XMLHTTP");}catch(e2){JSORM.fork({fn:callback,scope:scope,arg:[url,xmlHttp,false,options,"Your environment does not support AJAX!"]});}}}
var h=xmlHttp;xmlHttp.onreadystatechange=function(){var success;if(h.readyState==4){success=h.status==200||(document.location.protocol=='file:');callback.apply(scope,[url,h,success,options]);}};try{xmlHttp.open(method,url,true);if(params){if(typeof(params)==="string"){pstr=params;}else if(typeof(params)==="object"){pstr=[];for(i in params){if(params.hasOwnProperty(i)){pstr.push(i+"="+arg.params[i]);}}
pstr=pstr.join("&");}else{pstr=null;}}
xmlHttp.send(pstr);}catch(e3){options=options||{};options.e=e3;JSORM.fork({fn:callback,scope:scope,arg:[url,xmlHttp,false,options]});}};JSORM.extend=function(parent,constr,stat){var ret,proto;if(!parent){parent={};}else if(typeof parent=='object'){proto=parent;}else{proto=parent.prototype;}
ret=function(){var F=function(){};F.prototype=proto;var that=new F();that.superclass=proto;that.myclass=ret;if(constr!==null&&typeof(constr)=='function'){constr.apply(that,arguments);}
return(that);};if(stat){JSORM.apply(ret,stat);}
return ret;};JSORM.eventualize=function(that){var registry={};that.fire=function(event,params){var array,func,handler,i,len,pass=true,ret,p;var type=typeof(event)=='string'?event:event.type;if(registry.hasOwnProperty(type)){array=registry[type];for(i=0,len=array.length;i<len;i++){handler=array[i];func=handler.method;p=JSORM.apply({},handler.parameters);JSORM.apply(p,params);p.launcher=this;ret=func.apply(handler.scope,[p]);if(ret===false){pass=false;}}}
return(pass);};that.on=function(type,method,parameters,scope){var handler={method:method,parameters:parameters,scope:scope};if(registry.hasOwnProperty(type)&&method&&typeof(method)==="function"){registry[type].push(handler);}
return(this);};that.off=function(type,method,parameters){var array,i;if(registry.hasOwnProperty(type)){array=registry[type];for(i=0;i<array.length;i++){if(array[i].method===method&&array[i].parameters===parameters){registry.splice(i,1);break;}}}
return(this);};that.events=function(){for(var i=0;i<arguments.length;i++){registry[arguments[i]]=[];}};that.nonevents=function(){for(var i=0;i<arguments.length;i++){delete registry[arguments[i]];}};return(that);};/**
 * @author adeitcher
 * @fileOverview Ensure that appropriate vars are defined.
 */
/*
 * Ensure that our variables are in place
 */
/*global JSORM */
//JSORM = JSORM || {};


/**
 * @namespace Container for all jsormdb
 */
JSORM.db = {
	/** @namespace Container for all index components */
	index: {}, 
	/** @namespace Container for all parser components */
	parser: {}, 
	/** @namespace Container for all channel components */
	channel: {}
};

/**
 * @author Avi Deitcher
 * @fileOverview Channel to read/write from an HTTP server
 */
/*global JSORM */

/**
 * Create new HTTP channel
 * @class Channel to communicate over http via Ajax with the back-end server.
 * 
 * @param {Object} config Configuration object, must have at least one url parameter
 * @param {String} config.url URL to use for loading and updating. If it begins with '/', then absolute, else relative.
 * @param {String} config.loadUrl URL to use for loading. If it begins with '/', then absolute, else relative.
 * @param {String} config.updateUrl URL to use for updating. If it begins with '/', then absolute, else relative.
 */
JSORM.db.channel.http = JSORM.extend({}, function(config){
	config = config || {};
	// convenience
	var ajax = JSORM.ajax, fork = JSORM.fork, that = this;
	
	// our URLs; if only one url is given, use it for both
	var loadUrl = config.loadUrl || config.url, updateUrl = config.updateUrl || config.url;

	// create event-handling
	JSORM.eventualize(this);
	this.events('beforeupdate','update','updateexception','beforeload','load','loadexception');

	var processResponse = function(eSuccess, eFailure, filename, xhr, success, o) {
		var e, a, s, ct, ct2, res;
		if (success) {
			e = eSuccess; a = o.options; s = true;
			// because both types are sometimes used
			ct = xhr.getResponseHeader("Content-type");
			ct2 = xhr.getResponseHeader("Content-Type");
			res = ct === "text/xml" || ct2 === "text/xml" ? xhr.responseXML : xhr.responseText;
		} else {
			e = eFailure; a = xhr; s = false;
		}
		that.fire(e,o);
		o.callback.call(o.scope,{options: o.arg, success: s, response: res});		
	};
	
	var updateResponse = function(filename, xhr, success, o){
		processResponse("update","updateexception",filename,xhr,success,o);
	};

	var loadResponse = function(filename, xhr, success, o){
		processResponse("load","loadexception",filename,xhr,success,o);
	};
	
	var message = function(beforeevent, arg, callback, method, url) {
		var params = arg.params, cb = arg.callback, scope = arg.scope, options = arg.options;
        if(that.fire("beforeevent", params) !== false){
            var  o = {
                params : params || {},
                options: {
                    callback : cb,
                    scope : scope,
                    arg : options
                },				
                callback : callback,
				method: method,
                scope: this,
				url: url
            };
            ajax(o);
        }else{
			fork({fn: cb, scope: scope || that, arg: [{options: options, success: false}]});
        }		
	};
	
	JSORM.apply(this,/** @lends JSORM.db.channel.http.prototype */{
		/**
		 * Update the remote data source via http. This is presumed to be asynchronous, and thus will
		 * return before the call is complete. Use a callback to capture the result.
		 * 
		 * @param {Object} [config] Configuration information for the update
		 * @param {Object} [config.params] Parameters to add to the update. Each element is given as a parameter name to the HTTP
		 * 			PUT, while the values are expected to be Strings given as the value of HTTP parameter 
		 * @param {Function} [config.callback] Function to be executed when the update is complete, whether success or failure.
		 *   The callback should expect a single argument, an object, with the following elements:
		 *    <ul>
		 *     <li>success: boolean as to whether or not the update succeeded</li>
		 *     <li>options: the options that were passed to update as config.options</li>
		 *    </ul>
		 * @param {Object} [config.scope] Scope within which to execute the callback
		 * @param {Object} [config.options] Options to pass to the callback
		 */
	    update : function(arg){
			message("beforeupdate",arg,updateResponse, "POST", updateUrl);
		},
	
		/**
		 * Load from the remote data source via http. This is presumed to be asynchronous, and thus will
		 * return before the call is complete. Use a callback to capture the result.
		 * 
		 * @param {Object} [config] Configuration information for the load
		 * @param {Object} [config.params] Parameters to add to the load. Each element is given as a parameter name to the HTTP
		 * 			GET, while the values are expected to be Strings given as the value of HTTP parameter 
		 * @param {Function} [config.callback] Function to be executed when the load is complete, whether success or failure.
		 *   The callback should expect a single argument, an object, with the following elements:
		 *    <ul>
		 *     <li>success: boolean as to whether or not the load succeeded</li>
		 *     <li>options: the options that were passed to load as config.options</li>
		 *    </ul>
		 * @param {Object} [config.scope] Scope within which to execute the callback
		 * @param {Object} [config.options] Options to pass to the callback
		 */
		load : function(arg) {
			message("beforeload",arg,loadResponse, "GET", loadUrl);
		}

	});

});

/**
 * @author Avi Deitcher
 * @fileOverview JSON Parser to convert JSON into objects suitable for jsormdb and vice-versa
 */
/*global JSORM */
/**
 * Create a new JSON parser
 * @class Parser to convert JSON into objects when loaded from a channel and vice-versa
 * 
 * @param {Object} [config] Configuration parameters
 * @param {String} [config.id] Default field to use as the unique identifier field in parsed data
 * @param {String} [config.root] Default element to use as the root of actual records in parsed data
 */
JSORM.db.parser.json = JSORM.extend({}, function(config){
	config = config || {};
	var id = config.id, root = config.root, lastMeta = {}, lastRoot = {};
	
	// read - input JSON, write out objects
	JSORM.apply(this, /** @lends JSORM.db.parser.json.prototype */{
		/**
		 * Convert JSON into an object structure suitable to load into jsormdb
		 * 
		 * @param {String} json JavaScript Object Notation string with the appropriate information
		 * @returns {Object} An object with the appropriate elements
		 */
		read : function(json) {
			// first parse the data
			var data = null, p;
			p = JSON.parse(json);

			// data better be a valid object
			if (p && typeof(p) === "object") {
				data = {};
				// if it is an array, just use it directly 
				if (p.isArray) {
					data.records = p;
					data.id = id;
				} else {
					// find out our root and our id
					root = p.meta && p.meta.root ? p.meta.root : root;
					data.records = p[root];
					data.id = p.meta && p.meta.id ? p.meta.id : id;

					// keep the root information
					lastMeta = p.meta;
					lastRoot = root;
				}
			}

			return(data);
		},

		/**
		 * Convert an array of jsormdb objects into JSON as per the original load structure
		 * 
		 * @param {Object[]} records Array of records from a jsormdb database
		 * @returns {String} JSON-encoded String, including appropriate metadata and root
		 */
		write : function(records) {
			// hold our new structure
			var obj = {};
			obj[lastRoot] = records;
			if (lastMeta) {
				obj.meta = lastMeta;
			}
			var j = JSON.stringify(obj);
			if (!j) {throw{message: "JsonParser.write: unable to encode records into Json"};}
			return(j);
		}		
	});
});
/**
 * @author adeitcher
 * @fileOverview Parser to convert objects into objects, essentially making no translation. Because
 * the database must have a parser for other conversions, e.g. JSON and XML, we need an object parser as well, especially
 * when the channel talks to some other object generator.
 */
/*global JSORM */

/**
 * Create a new object parser
 * 
 * @class Parser to convert objects into objects, essentially making no translation. Because
 * the database must have a parser for other conversions, e.g. JSON and XML, we need an object parser as well, especially
 * when the channel talks to some other object generator.
 */
JSORM.db.parser.object = JSORM.extend({}, function(){
	var clone = JSORM.clone;
	
	JSORM.apply(this,/** @lends JSORM.db.parser.object.prototype */{
		/**
		 * Convert raw JavaScript object records into a structure appropriate for consumption by jsormdb
		 * 
		 * @param {Object[]} data Array of objects
		 * @returns {Object} Object data structure with the original data cloned and loaded
		 */
	    read : function(data){
			data = [].concat(clone(data,true));
			// return an object as expected
		    return {
		        records : data
		    };
	    },

		/**
		 * Convert jsormdb internal records into JavaScript objects. This method does almost nothing, just clones the 
		 * objects and passed them back.
		 * 
		 * @param {Object[]} records Records from a jsormdb
		 * @returns {Object[]} Cloned records
		 */
		write : function(records) {
			// clone so we do not confuse objects
			return(clone(records,true));
		}		
	});
});


/**
 * @fileOverview Database with full transactions, partial and complete rollbacks, load from and store
 * to server-side, and much much more
 * @author adeitcher
 */
/*global JSORM */

/** 
 * @constructor
 * Create new JSORM.db.db
 * @param {Object} [config] Configuration parameter.
 * @param {Object} [config.channel] Channel to use for communication with a remote data source
 * @param {Object} [config.parser] Parser to use for interepreting communication with a remote data source
 * @param {Object} [config.updateParams] Object literal with parameters to pass to the channel for each commit(), by default
 * @param {Object} [config.loadParams] Object literal with parameters to pass to the channel for each load(), by default
 */
JSORM.db.db = JSORM.extend({},	function(config) {
	// ensure config is an object for convenience
	config = config || {};

	// convenience definitions
	var clone = JSORM.clone, common=JSORM.common, apply=JSORM.apply, fork = JSORM.fork, first=JSORM.first;
	
	var journal = [], channel = config.channel || null, idField, myclass = this.myclass;
	// updateMode, writeMode
	var updateMode = config.updateMode || myclass.updates.nothing, writeMode = config.writeMode || myclass.modes.nothing;
	// we automatically use "type" as an indexed field
	var store = JSORM.db.engine.hash(JSORM.db.index.hash("type"));
	// default writeMode, updateMode
	var defaultWriteMode = myclass.modes.nothing, defaultUpdateMode = myclass.updates.nothing;
	// do we have a parser?
	var parser = config.parser || JSORM.db.parser.json();
	// params
	var updateParams = config.updateParams || {}, loadParams = config.loadParams || {};


	// create event-handling
	JSORM.eventualize(this);

	// register events that we handle
	this.events(
		'load', 'loadexception', 'add','datachanged','clear','update',
		'beforewrite','write','writeexception','commit', 'commitexception');

	/*
	 * START legacy event management stuff from when this was based upon Ext.ux.WriteStore
	 */
    //this.relayEvents(channel, ["updateexception"]);
	/*
	 * END legacy event management stuff from when this was based upon Ext.ux.WriteStore
	 */

	/*
	 * BEGIN PRIVATE FUNCTIONS
	 */

	/**
	 * Internal search function, returns the index
	 */
	var findInternal = function(args) {
		var ret = null, i, len, query, idx, data;
		
		// query the store
		idx = store.query(args.where);

		// now our idx, if valid, has all of the index entries;
		//  either return the indexes or get all of the actual entries
		if (idx) {
			if (args.index) {ret = idx;}
			else {
				ret = [];
				for (i=0,len=idx.length; i<len;i++) {
					data = store.get(idx[i]);
					ret.push(apply({},clone(data),args.fields));
				}				
			}
		}

		return(ret);
	};
	
	var clearInternal = function(log) {
		// log the event in the journal, unless suppressed
		if (log) {
			journal.push({type: myclass.types.clear, data: store.get()});
		}

		// clear out the data
		store.clear();
	};

	var loadData = function(data) {
		var r = data.records;
		clearInternal(false);
		idField = data.id || "id";
		store.addIndex(idField);		
		store.addIndex('type');
		store.insert(r);
		// clean out the journal
		journal.clear();
	};

	/**
	 * Load new records - called asynchronously with callback handler.
	 * Loading records always means the old transaction is wiped clean and a new transaction is begun
	 * immediately *after* the load is complete. In other words, the load itself is not in the journal. 
	 * The process is as follows:
	 * 1) Wipe journal clean (remove old transaction)
	 * 2) Do the load
	 * 3) Start a new transaction journal
	 */
	var loadCallback = function(args){
		var options = args.options || {}, r = [], parsed, processed = false;
		var e, sfcb, cb = args.callback, scope = args.scope || this;

		// only clear and load if we successfully get and parse the data
		if (args.success && (parsed = parser.read(args.response))) {
			// attempt to load the new data
			loadData(parsed);

			// we successfully processed
	        r = parsed.records;
			processed = true;

			// specific events
			sfcb = options.success;
			e = "load";
		} else {
			sfcb = options.failure;
			e = "loadexception";
		}

		// general event
        this.fire(e, {records: r, options: options});

		// specific success/failure callback
		if (sfcb && typeof(sfcb) === "function") {sfcb.call(scope, r, options, processed);}

		// always call our callback, whether successful or not
        if(cb && typeof(cb) === "function"){
			cb.call(scope, r, options, processed);
		}
	};

    var removeAt = function(index){
		var i,len, removed = [], entry;
		index = [].concat(index);
		for (i=0,len=index.length;i<len;i++) {
			entry = store.remove(index[i]);
			removed.push(entry);
		}
		return(removed);
    };

	var write = function(mode) {
		var data, tmp, i, len, j, lenj, recs = {}, entry, den, curId, condensed, orig;

		// replace mode just dumps it all
		if (mode === myclass.modes.replace) {
			// get the actual data in the records, no indexes, we don't care about the journal
			data = store.get();
		} else {
			data = [];
			/*
			 * If we already have an entry, so just update that one
			 * What we do with condensed largely depends on what we want to do next and what we did previously
			 * - If we are updating an already updated record, we can just add updates
			 * - If we are updating a record that was added in this transaction, just change the add data
			 * - If we are removing a record, make that the only activity
			 * - If we are adding a record, do it straight out
			 */
			condensed = mode === myclass.modes.condensed;

			// get the actual data in the record
			for (i=0, len=journal.length; i<len; i++) {
				// recall the structure of each journal entry
				//  {type: change/add/remove/clear/load, }
				entry = journal[i];
				if (entry !== null) {
					// go through each one, then see what we do
					switch(entry.type) {
						case myclass.types.change: 
							// keep a list of the affected IDs, and make sure they also point to this idx entry
							orig = entry.data.original;
							for (j=0,lenj=orig.length; j<lenj;j++) {
								curId = orig[j].id;
								// are we condensed, and did we have a previous entry?
								if (condensed && recs[curId]) {
									// previous ones will be add or change, so modify that one
									// if it was a change, we need to remove it
									apply(recs[curId].data,entry.data.changed);
								} else {
									// either a previous change to this record does not exist, or 
									den = {
										type: entry.type,
										data: clone(entry.data.changed)
									};
									// save the ID field
									den.data[idField] = curId;
									recs[curId] = den;
									data.push(den);									
								}
							}
							break;
						case myclass.types.add:
							// the data entry to be sent to the server - we need to get the actual data
							tmp = store.get(entry.data);
							// store these; there is no way we have a previous journal entry for a newly added record 
							for (j=0,lenj=tmp.length;j<lenj;j++) {
								den = {
									type: entry.type,
									data: tmp[j]
								};
								recs[tmp[j][idField]] = den;
								data.push(den);
							}
							break;
						case myclass.types.clear:
							data.push({
								type: entry.type
							});
							break;
						case myclass.types.remove:
							tmp = [];
							den = {};
							// keep a list of the affected IDs, and make sure they also point to this idx entry
							for (j=0, lenj=entry.data.length; j<lenj; j++) {
								curId = entry.data[j][idField];
								tmp.push(curId);
								// are we in condensed mode and there was a previous record?
								if (condensed && recs[curId]) {
									// previous ones will be add or change, so remove it from the list
									recs[curId].data.remove(curId);
									// if it was a change, we need to remove it
									if (recs[curId].type === myclass.types.change) {
										recs[curId] = den;																			
									}
								} else {
									recs[curId] = den;									
								}
							}
							den.type = entry.type; den.data = tmp;
							data.push(den);
							break;
						default:
							break;
					}					
				}
			}
		}
		return(data);
	};

	/**
	 * Handle the results of a write. 
	 * 
	 * @arg o Object options passed to the original write call
	 * @success boolean whether the write succeeded or not
	 * @response String full contents of response from the server
	 */	
	var writeCallback = function(args) {
		// if the POST worked, i.e. we reached the server and found the processing URL,
		// which handled the processing and responded, AND the processing itself succeeded,
		// then success, else exception
		var i, len, response = args.response, o = args.options || {}, update;
		var r = [], e, sfcb, cb = o.callback, scope = o.scope || this, options = o.options;
		var newRec, where, index;

		// the expectation for success is that the application itself will determine it
		//  via a 'write' handler
		if (args.success) {
			if (this.fire('write',{options: o, data: response}) !== false) {
				// update fields or even whole new records from the server
				//  if requested either via options.update or this.updateMode

				// we have a few possibilities:
				// 1) We replace all our data with that from the server - either we are in mode.replace or we explicitly 
				//    said to do so for this write
				// 2) We update our data with that from the server, i.e. apply journal changes
				// 3) We make no changes to our local data
				// which update mode will we work in? Try to use local option, then db-wide, then system default
				update = first(o.update,updateMode,defaultUpdateMode);

				switch(update) {
					case myclass.updates.nothing:
						// do nothing
						break;
					case myclass.updates.replace:
						// replace: read our data and then replace everything
						r = parser.read(response);
						loadData(r);
						break;
					case myclass.updates.update:
						// update: read our data and then go through each record one by one:
						// - if a record with this record's ID exists, update
						// - if one does not, add it a new
						r = parser.read(response);
						where = {field: idField, compare: 'equals'};

						// we worked in journal mode, so take the changes they recommend and apply them
						for (i=0, len=r.records.length; i<len;i++) {
							newRec = r.records[i];

							// do we have a record with this id? It should be indexed, because it is the ID field
							// if it exists, get the original record and update it, else mark it to add
							where.value = newRec[idField];
							index = findInternal({where: where, index: true});
							if (index && index.length > 0) {
								store.update(index,newRec);								
							} else {
								store.insert(newRec);
							}
						}
						break;
				}

				// clean out the journal
				journal.clear();

				// EVENTS AND CALLBACKS FOR SUCCESS
				// 1) Specific to this transaction
				sfcb = o.success;
				// 2) All commit registered handlers
				e = "commit";
			} else {
				// some callback said not to complete the write
				sfcb = o.failure;
				e = "commitexception";
			}
		} else {
			// EVENTS AND CALLBACKS FOR FAILURE
			// 1) Specific to this transaction
			sfcb = o.failure;
			// 2) All write failure registered handlers
			e = "writeexception";
		}

		// general event
		this.fire(e,{options: o, data: response});
		// success/failure callback
		if (sfcb && typeof(sfcb) === "function") {sfcb.call(scope,this,options,response);}
		// general callback
		if (cb && typeof(cb) === "function") {cb.call(scope,this,options,response);}
	};
	
	/*
	 * END PRIVATE FUNCTIONS
	 */
	
	/*
	 * BEGIN PRIVILEGED FUNCTIONS
	 */

	apply(this,/** @lends JSORM.db.db.prototype  */{
		/**
		 * Insert new data directly into the database. The parser will parse.
		 * An insert is considered part of a transaction and is logged in the journal. 
		 * If you wish to start afresh, use load() instead.
		 * 
		 * @param {Object[]} data Array of data objects to insert into the database
		 */
		insert : function(data) {
			var index;

			// parse the data if relevant
			if (data) {
				// if it is a string, send it to a parser, else use directly
				if (typeof(data) === "string") {
					data = parser.read(data);
					if (data && typeof(data) === "object") {data = data.records;}
				}

				// use internal function for the insert and log it to the journal
				index = store.insert(data);
				journal.push({type: myclass.types.add, data: index});

				// tell everyone we have added
		        this.fire("add", {records: data});
			}

		},

		/**
		 * Search by query. Returns an array of indexes. No matches will return an empty array; invalid query will return null.
		 * 
		 * @param {Object} params Search parameters
		 * @param {Object} params.where Proper query term, either composite or primitive
		 * @param {Object} [params.fields] Fields to return. This is an object literal. All fields that are set to non-null and 
		 *   have a match will return those fields. Returns all fields if null.
		 * @returns {Object[]} Array of the matched records
		 */
		find : function(params) {
			params = params || {};
			var data = findInternal({where: params.where, fields: params.fields, index: false});
			return(data);
		},

		/**
		 * Update records based on a where clause
		 * 
		 * @param {Object} params Update parameters
		 * @param {Object} params.where Proper query term, either composite or primitive, to determine which records to update.
		 *    If null, update all.
		 * @param {Object} data New data to enter into all the updated reocrds that match the search term. Single object literal.
		 */
		update : function(params) {
			var index, oldData, det = [], i, len, args = params || {}, id, idconf;
			// first find the indexes of all the entries that match the where clause
			index = findInternal({where: args.where, index: true});

			// get the oldData and update the records
			oldData = store.update(index,args.data);
			
			// get the IDs of those fields
			idconf = {};
			idconf[idField] = true;
			id = store.get(index,idconf);

			// create the journal of the change
			for (i=0,len=index.length;i<len;i++) {
				det.push({index: index[i], data: oldData[i], id: id[i][idField]});
			}

			// journal the change
			journal.push({type: myclass.types.change, data: {changed: args.data, original: det}});

			// fire the event
			this.fire("update",{records: store.get(index)});
		},


		/**
		 * Load new data to reinitialize this database. This is different from {@link insert} in several ways:
		 * <ol>
		 * <li>The load (and possible replace) are not considered part of the current transaction. The 
		 *     current transaction is terminated, and a new transaction is started immediately after the load</li>
		 * <li>The load can come from either data passed directly or from the channel</li>
		 * <li>load is always asynchronous, whereas insert is synchronous</li>
		 * </ol>
		 * 
		 * @param {Object} args Arguments to the load.
		 * @param {Object} [args.data] Raw data to load. If null, will use the defined channel and parser.
		 * @param {Function} [args.callback] Function to call when the load is complete
		 * @param {Function} [args.success] Function to call when the load succeeds
		 * @param {Function} [args.failure] Function to call when the load fails
		 * @param {Object} [args.scope] Scope within which to call the callbacks. 
		 * @param {Object} [args.options] Object with options to pass to the callback. 
		 */
		load : function(args) {
			args = args || {};
			var params, tp = {callback: args.callback, success: args.success, failure: args.failure, 
				scope: args.scope, options: args.options};
			// need to insert full load from channel function, followed by loadCallback as an async callback
			if (args.data) {
				tp.success = true;
				tp.response = args.data;
				fork({fn: loadCallback, arg: [tp], scope: this});
			} else if (channel) {
				// load asynchronously via the channel, with loadCallback as the callback

				// combine the user params for this call - first the base loadParams, then the per-call params

				// if updateParams have been set for this store, set them
				params = apply({}, loadParams);
				// if particular params have been set for this call, set them
				apply(params, args.params);

				// add any options
				channel.load({params: params, scope: this, callback: loadCallback, options: tp});
			} else {
				// if no channel was defined, and we were not passed data, we cannot load
				tp.success = false;
				fork({fn: loadCallback, arg: [tp], scope: this});				
			}
			return(this);

		},

		/**
		 * Remove records from the database.
		 * 
		 * @param {Object} params Parameters for the removal.
		 * @param {Object} [params.where] Search term, either primitive or composite, to determine which records to remove.
		 */
	    remove : function(params){
			var args = params || {};
	        var index = findInternal({where: args.where, index: true});
			var removed = removeAt(index);
			// mark the record itself as having been deleted, so we can know if we commit it
			journal.push({type: myclass.types.remove, data: removed});
	    	this.fire("remove", {records: removed});
	    },

		/**
		 * Clear the database entirely. This is a journaled event and is part of the current transaction.
		 * If you wish to start afresh, use load() instead
		 */
	    clear : function(){
			clearInternal();
			// record that all objects have been removed
	        this.fire("clear");
	    },

		/**
		 * Determine how many changes have been made in the current transaction.
		 * 
		 * @returns {Integer} Number of change steps in the current transaction
		 */
		getModifiedCount: function() {
			return(journal.length);
		},

		/**
		 * Determine if there are any changes in the current transaction. Equivalent of {@link getModifiedCount}() > 0
		 * 
		 * @returns {boolean} If there are any changes
		 */
		isDirty: function() {
			return(journal.length > 0);
		},

		/**
		 * Commit the current transaction. If there is a channel, and a non-nothing update mode,
		 * it will write to the store. If there is no channel, it will just commit. 
		 * The commit mode is determined by the following:
		 * <ul>
		 * <li>options.mode - for this transaction</li>
		 * <li>writeMode - default for this db instance</li>
		 * <li>defaultWriteMode - default for all instances of the db</li>
		 * </ul>
		 * 
		 * @param {Object} [options] Commit options
		 * @param {Object} [options.mode] Which mode to use for committing, one of the static modes
		 * @param {Object} [options.params] Parameters to pass to the channel as part of the update
		 * @param {Function} [options.callback] Function to call when the commit is complete
		 * @param {Function} [options.success] Function to call when the commit has succeeded
		 * @param {Function} [options.failure] Function to call when the commit has failed
		 * @param {options.Object} [options.scope] Scope within which to execute the callbacks
		 * @param {options.Object} [options.options] Options to pass to the callbacks
		 */
	    commit : function(options){
			options = options || {};
			var params, records, mode;
			// which mode will we work in? Try to use local option, then store-wide, then global default
			mode = first(options.mode,writeMode,defaultWriteMode);


			// if there is not channel, we just commit internally
			if (!channel || (mode === myclass.modes.nothing)) {
				journal.clear();
				this.fire("commit",{options: options});			
			} else {
				if (this.fire("beforewrite",{options: options}) !== false) {
					// get the appropriate records - watch out for bad records
					records = write(mode);

					// combine the user params for this call - first the base updateParams, then 
					//   the per-call params. Finally, our privileged params and we can send

					// if updateParams have been set for this store, set them
					params = apply({}, updateParams);
					// if particular params have been set for this call, set them
					apply(params, options.params);
					// finally, add all our params
					apply(params,{
						data: parser.write(records),
						mode: mode
					});

					// add any options
		            channel.update({params: params, callback: writeCallback, scope: this, options: options});			
				}
			}
	    },

		/**
		 * Reject a transaction. If given a count, it will reject the last count activities. If given no count,
		 * a count of 0, or a count greater than the total number of activities in this transaction, it will
		 * reject the entire transaction.
		 * 
		 * @param {Integer} count Number of steps within the transaction to reject. If empty, 0, or greater than the 
		 *   total number of steps, the entire transaction will be rejected.
		 */
	    reject : function(count){
			// are we rejecting all or some?
			var start = 0, index, data, type, i, j, len, lenj, orig;
			if (!count || count > journal.length) {
				count = journal.length;
				start = 0;
			} else {
				start = journal.length - count;
			}

			// back out the last 'count' changes in reverse order
			// get the last 'count' elements of the journal
			var m = journal.splice(start,count).reverse();
			for (i=0, len=m.length; i<len; i++) {
				index = m[i].index; data = m[i].data; type = m[i].type;
				switch(type) {
					case myclass.types.change:
						//data: {changed: args.data, original: det}
						// reject the changes - although the change itself may have been in bulk,
						//   the old data may have been not. Thus, we need to update each one independently
						orig = data.original;
						for (j=0, lenj=orig.length; j<lenj; j++) {
							store.update(orig[j].index, orig[j].data);
						}
						break;
					case myclass.types.add:
						// undo the add by removing the entry from the end, based on how many there are
						// we remove it from store by index location
						removeAt(data);
						break;
					case myclass.types.remove:
						// put it back
						store.insert(data);
						break;
					case myclass.types.clear:
						// put it back
						store.insert(data);
						break;
					default:
						// do nothing
				}
			}
			// need to fire an event that the data has been updated
	    }
	});
	
	/*
	 * END PRIVILEGED FUNCTIONS
	 */
	
	// were we told which fields to index?
	store.addIndex(config.index);
	// always index 'type'
	store.addIndex('type');
	
	// did we have any data to start?
	if (config.data) {
		this.load({data: config.data});
	}
		
},/** @lends JSORM.db.db  */{
	/**
	 * fixed methods for sending data back to the server
	 */
	modes: {nothing: 0, replace: 1, update: 2, condensed: 3},
	
	/**
	 * fixed methods for updating the store after a response from the server
	 */
	updates: {nothing: 0, update: 1, replace: 2},
	
	/**
	 * fixed types for journal entries
	 */
	types : {change: 0, add: 1, remove: 2, clear: 3, load: 4},
	
	/**
	 * fixed types for joins
	 */
	joins: {or: 0, and: 1}
});

/**
 * @author adeitcher
 * @fileOverview Storage engines for jsormdb. Currently only supports in-memory array and in-memory hash
 */
/*global JSORM */


/** 
 * @namespace Container for all engine components, and parent for included engines
 */
JSORM.db.engine = function(){
	var apply = JSORM.apply, clone = JSORM.clone;
	var compares, pass1, pass2, pass3, intersection, union, keysAsArray, isPrimitive, isCompound;
	
	compares = {
		equals: function(name,val) {return(function(entry){return(entry[name]===val);});},
		"in": function(name,val) {
				var h, ret;
				if (val.isArray) {h=val.hasher(); ret = function(entry){return(h.hasOwnProperty(entry[name]));};}
				else {ret = null;}
				return(ret);
			},
		gt: function(name,val) {
				return(typeof(val) === "number" ? function(entry){return(entry[name]>val);} : null);
			},
		ge: function(name,val) {
				return(typeof(val) === "number" ? function(entry){return(entry[name]>=val);} : null);
			},
		lt: function(name,val) {
				return(typeof(val) === "number" ? function(entry){return(entry[name]<val);} : null);
			},
		le: function(name,val) {
				return(typeof(val) === "number" ? function(entry){return(entry[name]<=val);} : null);
			},
		starts: function(name,val) {
				return(typeof(val) === "string" ? function(entry){return(entry[name].indexOf(val) === 0);} : null);
			},
		ends: function(name,val) {
				return(typeof(val) === "string" ? function(entry){var a = entry[name]; return(a.length-a.indexOf(val)-val.length === 0);} : null);
			},
		contains: function(name,val) {
				return(typeof(val) === "string" ? function(entry){return(entry[name].indexOf(val) >= 0);} : null);
			},
		isnull: function(name,val) {return(function(entry){return(entry[name]===null);});},
		notnull: function(name,val) {return(function(entry){return(entry[name]!==null);});}
	};	

	intersection = function() {
		var result,i,len,o;
		if (!arguments || arguments.length<1) {
			result = {};
		} else if (arguments.length == 1 && typeof(arguments[0]) === "object") {
			result = arguments[0];
		} else {
			result = arguments[0].isArray ? arguments[0].hasher() : arguments[0];
			for (i=1,len=arguments.length;i<len;i++) {
				o = arguments[i].isArray ? arguments[i].hasher() : arguments[i];
				result = JSORM.common(result,o,true);
			}
		}
		return(result);
	};
	
	union = function() {
		var result,i,len,o;
		if (!arguments || arguments.length<1) {
			result = {};
		} else {
			result = {};
			for (i=0,len=arguments.length;i<len;i++) {
				o = arguments[i].isArray ? arguments[i].hasher() : arguments[i];
				result = JSORM.apply(result,o);
			}					
		}
		return(result);
	};
	
	keysAsArray = function(o) {
		var i, r = [];
		for (i in o) {
			if (i && o.hasOwnProperty(i) && typeof(o[i]) !== "function") {r.push(i);}
		}		
		return(r);
	};
	
	isPrimitive = function(where) {
		return(where.hasOwnProperty('field') && where.field && typeof(where.field) === "string" &&
			where.hasOwnProperty('compare') && where.compare && compares[where.compare] && 
			(where.hasOwnProperty("value") || where.compare === "isnull" || where.compare === "notnull"));
	};
	isCompound = function(where) {
		return(where.hasOwnProperty("join") && (where.join === "and" || where.join === "or") && 
				where.hasOwnProperty("terms") && where.terms.isArray);
	};
	
	/**
	 * First pass against the query tree. Attempts to match any primitive against the index.
	 * 
	 * @param {Object} where A standard query term, either composite or primitive
	 * @param {Object} index The index
	 * @return {Object} Results tree, where each primitive is either a function to pass a record or an array of result indexes
	 * @private
	 */
	pass1 = function(where,index) {
		var r, r2, i, len, subm;

		// is it a primitive?
		if (isPrimitive(where)) {
				// can we get a result from the index?
				if ((subm = index.find(where)) !== null) {
					r = subm;
				} else {
					// we cannot get from index, so create the function that will process any values
					r = compares[where.compare](where.field,where.value);
				}
		} else if (isCompound(where)) {
			// is it a compound?
			r = {join: where.join, terms:[], fn:[],comps:[]}
			if (where.type) {r.type = where.type};
			for (i=0, len=where.terms.length; i<len; i++) {
				r2 = pass1(where.terms[i],index);
				// determine if it is a list of indexes, or a function
				if (r2.isArray) {
					// indexes, so we merge appropriately
					// if it is and, we want the union; if not, the intersection
					r.terms.push(where.terms[i]);
				} else if (typeof(r2) === "function"){
					// function, so we keep each one
					r.fn.push(r2);
				} else {
					// another compound
					r.comps.push(r2);					
				}
			}
		} else {
			r = null;
		}
		return(r);						
	};
	
	/**
	 * Second pass against the query tree. Resolve any functions using the resultant intersections or all records
	 * 
	 * @param {Object} where A query tree, output of pass1(), where each primitive is a fn() or []
	 * @param {}
	 * @return {Object} Results tree, where each primitive is a set of indexes
	 * @private
	 */
	pass2 = function(where,foreach,index,limit) {
		// q is a function that returns null, unless it explicitly becomes valid
		var r = [], r2, r3, subquery, i, len, j, lenj, list, keeper, typelimit;
		
		/*
		 * How does this work? Everything passed will be like a compound.
		 * 		A: join AND: 
		 * 				1) take the intersection of any earlier terms
		 * 				2) take those results, and feed each one into each function. Those for which every function returns 
		 * 					true, we keep; others are discarded
		 * 				3) take those results, and use them as a limit. Feed those as the limiting factor into 
		 * 					each sub-compound
		 * 			Any that survive all three steps are valid.
		 * 		B: join OR:
		 * 				1) take the union of any earlier terms
		 * 				2) take the limit, or the entire data set, and feed each one into each function. Those for which any
		 * 					function returns true, we keep; others are discarded
		 * 				3) take the limit, or the entire data set, and feed each one into each sub-compound. Union the results
		 * 					of each compound into the total set.
		 * 			Any that survive any one step are valid.
		 */
		// is there a type limit?
		if (where.type) {
			typelimit = index.find({field:'type',compare:'equals',value:where.type});
			limit = limit ? intersection(limit,typelimit) : typelimit.hasher();
		}
		
		if (where.join === "and") {
			// AND join - intersection
			
			// was there any limit to start?
			if (limit) {r2 = limit;}
			
			// 1) if we had any where terms, further restrict
			if (where.terms && where.terms.length>0) {
				// first merge all of the previous terms
				r3 = intersection.apply(this,where.terms);
				r2 = r2 ? intersection(r3,r2) : r3;
			}
			
			// 2) feed the matching function into foreach - keep only those that match every function
			if (where.fn && where.fn.length > 0) {
				// go through each one from before
				r2 = foreach(function(record) {
					// will we keep this?
					keeper = true;
					for (i=0,len=where.fn.length;i<len;i++) {
						if (!where.fn[i](record)) {
							// it did not match even one function, and we are doing intersection AND,
							//  so skip entirely
							keeper = false;
							break;
						}
					}
					return(keeper);
				},r2?keysAsArray(r2):null);
			}
			
			// intersection with any sub-compounds - must be limited to r2
			if (where.comps && where.comps.length>0) {
				for (i=0,len=where.comps.length;i<len;i++) {
					// AND = intersection, therefore only those in both the sub-compound *and* 
					//    the current r2 are kept.
					r2 = pass2(where.comps[i],foreach,index,r2);
				}
			}

		} else {
			// OR join - union
			
			// take the limit (if any), else the entire data set as our starting point
			// feed that into the first function
			// the results of the first function are saved
			// feed the limit (if any), else the entire data set into the second function 
			// add those results to the results of the first function
			// repeat for all of the functions
			// results are all are the final set

			// 1) use the limit or entire data set as a starting point

			// union with the previous terms from the indexed output
			if (where.terms.length>0) {
				r2 = union.apply(this,where.terms);
				r2 = limit ? intersection(r2,limit) : r2;
			}
			
			
			// 2) feed the function into foreach, adding the results to the final set
			if (where.fn.length > 0) {
				r3 = foreach(function(record){
					var matched = false;
					for (i=0,len=where.fn.length;i<len;i++) {
						// go through each function; as soon as one is matched on this entry, keep it and go to next
						//      index entry
						if (where.fn[i](record)) {
							matched = true; 
							break;
						}
					}
					return(matched);
				},limit);
				r2 = r2 ? union(r2,r3) : r3.hasher();					
			}
			
			// 3) results are all of the final set, the union of the output of all functions, i.e. r2
			
			// union with any sub-compounds
			if (where.comps.length>0) {
				for (i=0,len=where.comps.length;i<len;i++) {
					if ((r3 = pass2(where.comps[i],foreach,index,limit)) && r3.isArray) {
						for (j=0,lenj=r3.length; j<lenj;j++) {
							r2[r3[j]] = true;
						}
					}
				}
			}
		}
		// r2 now contains a hash, where each key is a valid index, and each value is true;
		//  just turn it into an array in r
		if (r2) {
			r = r2.isArray ? r2 : keysAsArray(r2);				
		} else {
			r = [];
		}

		// we have now devolved an entire compound of primitives into a single array of indexes
		//     which is precisely what we wanted
		return(r);
	};
	

	return /** @lends JSORM.db.engine  */{
		/**
		 * Construct a query function from a where statement that is suitable to testing each record in a table for 
		 *   a full-table scan
		 * 
		 * @param {Object} where Standard search term, either primitive or composite
		 * @returns {Function} A function that takes a single javascript object, i.e. a table record, 
		 *    as an argument and reports if it matches by returning a boolean: true or false
		 */
		executeQuery : function(where,index,foreach) {
			var i, len, subm, match = [], idx, fn, results, tmp;

			// if the where is blank, just return them all
			if (!where) {
				results = foreach(function(record){
					return(true);
				});
			} else {
				// before we do it, the root of our tree must always be a compound
				if (isPrimitive(where)) {
					tmp = {join:'and'};
					if (where.type) {tmp.type = where.type;}
					delete where.type;
					tmp.terms = [where];
					where = tmp;
				}
				
				// two passes
				// first pass: for each primitive, convert to results from index or function
				//             for each compound, split terms of the compound into: compounds, results or functions
				results = pass1(where,index);

				// second pass: go through the tree, resolve each function by passing it the results of the intersection (AND)
				//    or all of the records (OR) and mergin the results together
				//  
				results = pass2(results,foreach,index);				
			}
			
			
			return(results);		
		}		
	};
	
}();

/** 
 * Create new JSORM.db.engine.array.
 * @class Array-based in-memory storage engine.<br/>
 * Note: array engine does not support indexing
 */
JSORM.db.engine.array = JSORM.extend(JSORM.db.engine,function() {
	this.type = "array";
	var data = [], index = null;
	var apply = JSORM.apply;
	// the looping function
	var foreach = function(fn,limit) {
		var i, len, r = [];
		if (limit && limit.isArray)  {
			for (i=0,len=limit.length;i<len;i++) {
				if (fn(data[limit[i]])) {
					r.push(limit[i]);
				}
			}
		} else {
			for (i=0,len=data.length;i<len;i++) {
				if (fn(data[i])) {
					r.push(i);
				}
			}
		}
		return(r);			
	};

	
	
	apply(this,/** @lends JSORM.db.engine.array.prototype  */{
		/**
		 * Determine how many records are in the database. Equivalent of "select count(index)"
		 * 
		 * @returns {Integer} Number of records
		 */
		length : function() {
			return(data.length);
		},
		/**
		 * Insert an arbitrary number of records into the database. 
		 * 
		 * @param {Object|Object[]} records The records to insert, either a single JavaScript object or an array of objects.
		 */
		insert : function(records) {
			var i, len, locs = [], index = data.length;

			// add it to the array
			data.insert(index,records);
			// create the info for the index
			for (i=0, len=records.length; i<len; i++) {locs.push(index+i);}
		},

		/**
		 * Remove a single record from the database at a particular location. 
		 * 
		 * @param {Integer} index The location at which to remove the record
		 * @returns {Object} The removed record
		 */
		remove : function(index) {
			var entry = data.splice(index,1);		
			// remove from the index, if relevant
			return(entry);
		},

		/**
		 * Clear all records from the database.
		 */
		clear : function() {
			data.clear();
		},

		/**
		 * Get records at one or more locations. 
		 * Equivalent of "select * where index in [index]" or "select * where index = index"
		 * 
		 * @param {Integer|Integer[]} index A location or array of locations whose records are desired.
		 * @param {Object} fields An object indicating which fields of the records at index to retrieve. The object should
		 *    have one element with a value of true for those elements in the record desired in the results. If the fields
		 *    argument is null or undefined, all fields are returned.
		 * @returns {Object|Object[]} The fields desired for the records selected, either a single record if index is an
		 *    integer or an array of record of index is an array.
		 */
		get : function(idx, fields) {
			var ret, i, len;
			if (idx === null || typeof(idx) === "undefined") {
				ret = data;
			} else if (idx && idx.isArray) {
				ret = [];
				for (i=0, len=idx.length; i<len; i++) {
					ret.push(apply({},data[idx[i]],fields));
				}
			} else {
				ret = apply({},data[idx],fields);
			}
			return(ret);
		},

		/**
		 * Update records at one or more locations. 
		 * Equivalent of "update newData where index in [index]" or "update newData where index = index"
		 * 
		 * @param {Object} newData An object with the data to replace at the desired indexes. 
		 * @param {Integer|Integer[]} index A location or array of locations whose records are desired to be updated.
		 * @returns {Object[]} The changed fields of the old records.
		 */
		update : function(idx, newData) {
			var r, i, len, oldData = [], changes;
			for (i=0,len=idx.length; i<len; i++) {
				// get the existing record
				r = data[idx[i]];
				if (r) {
					// keep the old data
					changes = {};
					// for each entry in the new data, keep the old data at that entry, and then overwrite it in the
					//   core data store
					apply(changes,r,newData);
					apply(r,newData);
					oldData[i] = changes;
				}			
			}

			// return the old data for the journalling
			return(oldData);
		},

		/**
		 * Add a new field or fields to the index.
		 * 
		 * @param {String|String[]} fields String name of a field to add, or an array of fields. If the field is already
		 *   indexed or does not exist, nothing will happen for those fields. 
		 */
		addIndex : function(fields) {
			// array does not really support indexing
		},

		/**
		 * Remove a field or fields from the index.
		 * 
		 * @param {String|String[]} fields String name of a field to remove, or an array of fields. If the field is not
		 *   indexed or does not exist, nothing will happen for those fields. 
		 */
		removeIndex : function(fields) {
			// array does not really support indexing
		},

		/**
		 * Search for records within the database.
		 * 
		 * @param {Object} where Standard search term, either a primitive or a composite
		 * @param {Integer[]} limit List of indexes to check for a match. If blank, will check all entries.
		 * @return {Integer[]} Array of indexes that match the query
		 */
		query : function(where) {
			return(this.executeQuery(where,index,foreach));
		}
	});
		
});
	
	
	
/** 
 * Create new JSORM.db.engine.hash
 * @class Hash-based in-memory storage engine
 * 
 * @param {Object} index A pre-constructed index to use for this table storage engine. If none is passed, use the default
 *    JSORM.db.index.hash.
 */
JSORM.db.engine.hash = JSORM.extend(JSORM.db.engine,function(index) {
	this.type = "hash";
	var data = {}, length = 0, max = 0, unused = [];
	var apply = JSORM.apply; 
	index = index || JSORM.db.index.hash();

	var foreach = function(fn,limit) {
		var i,len,r = [];
		if (limit) {
			for (i=0,len=limit.length;i<len;i++) {
				if (fn(data[limit[i]])) {
					r.push(limit[i]);
				}
			}
		} else {
			for (i in data) {
				if (fn(data[i])) {
					r.push(i);
				}
			}
		}
		return(r);
	};

	apply(this,/** lends JSORM.db.engine.hash.prototype */{
		/**
		 * Determine how many records are in the database. Equivalent of "select count(index)"
		 * 
		 * @returns {Integer} Number of records
		 */
		length : function() {
			return(length);
		},

		/**
		 * Insert an arbitrary number of records into the database. 
		 * 
		 * @param {Object|Object[]} records The records to insert, either a single JavaScript object or an array of objects.
		 */
		insert : function(records) {
			var i, len, idx, locs = [];

			// all records are added at the next available slot
			for (i=0,len=records.length;i<len;i++) {
				// the place we put it is either at the next unused spot, or at the max, which must then be incremented
				if (typeof(idx = unused.shift()) === "undefined") {idx = max++;}
				data[idx] = records[i];
				// save the index where it was
				locs.push(idx);

				// extend the length
				length++;
			}

			// add the new records to the index
			index.add(locs,records);

			return(locs);
		},

		/**
		 * Remove a single record from the database at a particular location. 
		 * 
		 * @param {Object} index The internal index location at which to remove the record
		 * @returns {Object} The removed record
		 */
		remove : function(idx) {
			var entry = data[idx];
			delete data[idx];
			// remove from the index, if relevant
			index.remove(idx,entry);
			length--;
			// reduce the max, if we just reduced the last one
			if (idx+1 === max) {
				max--;
			} else {
				unused.push(idx);
			}
			return(entry);
		},

		/**
		 * Clear all records from the database.
		 */
		clear : function() {
			// clear out the data
			JSORM.clear(data);
			// clear out the index
			index.clear();
			// clear out the unused
			unused.clear();
			// mark that we are empty
			length = 0;
			// the max is 0
			max = 0;
		},

		/**
		 * Get records at one or more locations. 
		 * Equivalent of "select * where index in [index]" or "select * where index = index"
		 * 
		 * @param {Integer|Integer[]} index A location or array of locations whose records are desired.
		 * @param {Object} fields An object indicating which fields of the records at index to retrieve. The object should
		 *    have one element with a value of true for those elements in the record desired in the results. If the fields
		 *    argument is null or undefined, all fields are returned.
		 * @returns {Object|Object[]} The fields desired for the records selected, either a single record if index is an
		 *    integer or an array of record of index is an array.
		 */
		get : function(idx,fields) {
			var ret, i, len;
			if (idx === null || typeof(idx) === "undefined") {
				// need to return as an array
				ret = [];
				for (i in data) {
					if (i && typeof(i) !== "function" && typeof(data[i]) === "object") {ret.push(data[i]);}
				}
			} else if (idx && idx.isArray) {
				ret = [];
				for (i=0, len=idx.length; i<len; i++) {
					ret.push(apply({},data[idx[i]],fields));
				}
			} else {
				ret = apply({},data[idx],fields);
			}
			return(ret);
		},

		/**
		 * Update records at one or more locations. 
		 * Equivalent of "update newData where index in [index]" or "update newData where index = index"
		 * 
		 * @param {Object} newData An object with the data to replace at the desired indexes. 
		 * @param {Integer|Integer[]} index A location or array of locations whose records are desired to be updated.
		 * @returns {Object[]} The changed fields of the old records.
		 */
		update : function(idx, newdata) {
			var r, i, len, oldData = [], changes;
			idx = [].concat(idx);
			for (i=0,len=idx.length; i<len; i++) {
				// get the existing record
				r = data[idx[i]];
				if (r) {
					// keep the old data
					changes = {};
					// for each entry in the new data, keep the old data at that entry, and then overwrite it in the
					//   core data store
					apply(changes,r,newdata);
					apply(r,newdata);
					oldData[i] = changes;
					// update the index
					index.update(changes,newdata,idx[i]);				
				}			
			}

			// return the old data for the journalling
			return(oldData);
		},

		/**
		 * Add a new field or fields to the index.
		 * 
		 * @param {String|String[]} fields String name of a field to add, or an array of fields. If the field is already
		 *   indexed or does not exist, nothing will happen for those fields. 
		 */
		addIndex : function(fields) {
			index.fields(fields);
		},

		/**
		 * Remove a field or fields from the index.
		 * 
		 * @param {String|String[]} fields String name of a field to remove, or an array of fields. If the field is not
		 *   indexed or does not exist, nothing will happen for those fields. 
		 */
		removeIndex : function(fields) {
			index.unfields(fields);
		},

		/**
		 * Search for records within the database.
		 * 
		 * @param {Object} where Standard search term, either a primitive or a composite
		 * @param {Object[]} limit List of indexes to check for a match. If blank, will check all entries.
		 * @return {Object[]} Array of indexes that match the query
		 */
		query : function(where) {
			return(this.executeQuery(where,index,foreach));
		}
		
	});
	
});


/**
 * @author adeitcher
 * @fileOverview Indexes for jsormdb. Currently provides only in-memory hash
 */
/*global JSORM */

/** 
* Create new JSORM.db.index.hash
 * @class Hash-based in-memory index for a database table. Supports only equals matches. For < <= > >= starts, use a B-tree.
 * 
 * @param {String|String[]} fields Single name of field or array of field names to initially index. Can be changed later.
 */
JSORM.db.index.hash = JSORM.extend({},function(f) {
	this.type = "hash";
	var fields = 0, data = {};
	
	JSORM.apply(this,/** @lends JSORM.db.index.hash.prototype */{
		/**
		 * Add fields to the index. If the field is already indexed, do nothing.
		 * 
		 * @param {String|String[]} f Name or array of names of fields to index
		 */
		fields : function(f) {
			var i, len;
			if (f) {
				f = [].concat(f);
				for (i=0,len=f.length; i<len; i++) {
					// only need to register it if it is a string and we do not yet have it
					if (typeof(f[i]) === "string" && !data.hasOwnProperty(f[i])) {
						data[f[i]] = {};
						fields++;
					}
				}
			}
		},

		/**
		 * Remove fields from the index. If the field is not indexed, do nothing.
		 * 
		 * @param {String|String[]} f Name or array of names of fields to remove from the index
		 */
		unfields : function(f) {
			var i, len;
			if (f) {
				f = [].concat(f);
				for (i=0,len=f.length; i<len; i++) {
					// only need to unregister it if it is a string and we already have it
					if (typeof(f[i]) === "string" && data.hasOwnProperty(f[i])) {
						delete data[f[i]];
						fields--;
					}
				}
			}
		},

		/**
		 * Add one or more records to the index, including the location where they are located. The location
		 * is expected to be internal to the table engine implementation and have no meaning outside of that engine.
		 * 
		 * @param {Array} index Array of internal location reference pointers for the added records
		 * @param {Object[]} records Full set of records to index. This array must be precisely the same length as the index
		 *   array.
		 */
		add : function(index, records) {
			var i,j,len, ci, dj, rij;
			// add to the index only if something has been indexed
			if (fields > 0) {
				// work as an array
				records = [].concat(records);
				index = [].concat(index);
				// go through each indexed field, for each record
				for (i=0, len=records.length; i<len; i++) {
					ci = index[i];
					for (j in data) {
						// if this is a property in the index data, and it exists on the record, record it
						if (data.hasOwnProperty(j) && records[i].hasOwnProperty(j)) {
							dj = data[j]; rij = records[i][j];
							dj[rij] = dj[rij] || [];
							dj[rij].push(ci);
						}
					}
				}
			}

		},

		/**
		 * Remove single record from the index, either by index or by record. First preference is record, if blank then index.
		 * 
		 * @param {Object} index Indexed location, internal to the storage engine
		 * @param {Object} record Actual record to remove
		 */
		remove : function(index, record) {
			var j;
			// first try by record
			for (j in data) {
				if (data.hasOwnProperty(j) && record.hasOwnProperty(j)) {
					// remove the reference to this index
					data[j][record[j]].remove(index);
				}
			}		
		},

		/**
		 * Clear the index
		 */
		clear : function() {
			var i;
			for (i in data) {
				if (data.hasOwnProperty(i)) {
					JSORM.clear(data[i]);
				}
			}
		},

		/**
		 * Find all records that fit a particular query. There are three possible responses:
		 * <ul>
		 * <li>match - found some records that match the query, hence will return an array of locations</li>
		 * <li>nomatch - able to perform the query, but found no matches, hence return an empty array</li>
		 * <li>noquery - unable to perform the query because one or more of the following is true:
		 *   <ul>
		 * 		<li>The query type compares clause is not indexable by this index, e.g. "contains"</li>
		 * 		<li>The query type is invalid or not a primitive</li>
		 * 		<li>The query type field is not indexed</li>
		 * </ul>
		 * For example, a match returns an array [1,5,789]; nomatch returns an empty array []; noquery returns null. 
		 * 
		 * @param {Object} query A standard search term; a primitive will be accepted while a composite will be ignored
		 * @returns {Array} Array of matches locations, internal to the storage engine, empty if not matches, null if field
		 *    is not indexed or the search type is not compatible 
		 */
		find : function(query) {
			var ret = null, field;
			// first check if this is something we can match
			if (query && query.field && query.compare && (field = data[query.field]) && query.compare === "equals") {
				// we return the indexes where it matches
				ret = field[query.value];
			}
			return(ret);
		},

		/**
		 * Update the information in one record. If a field is changed, and that field is indexed mark it as changed.
		 * 
		 * @param {Object} old The old data for the record. Only the changed data should be passed.
		 * @param {Object} newdata The new data for the record. Only the changed data should be passed.
		 * @param {Object} index The index of the record.
		 */
		update : function(old,newdata,index) {
			var i, field;
			// check each field if it is indexed
			for (i in newdata) {
				if (newdata.hasOwnProperty(i) && data.hasOwnProperty(i) && (field = data[i]) && old[i] != newdata[i]) {
					// if the field is indexed, change the value for a particular index. Here it is indexed,
					//  so we remove the index from the old value and add it to the new
					field[old[i]].remove(index);
					field[newdata[i]].push(index);
				}
			}
		}
	});
	// initialize fields
	this.fields(f);
	
});

exports.JSORM = JSORM;

/**
 * @ignore
 */
/*
    http://www.JSON.org/json2.js
    2008-11-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    JSON = {};
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
})();

