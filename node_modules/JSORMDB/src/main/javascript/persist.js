/** 
 * @constructor
 * Create new JSONDatabase
 *
 * @param {Object} [config] Optional configuration parameter.
 * @param {Object} [config.path] path to the database file.
 * @param {Object} [config.transactional] Set database in transactional mode. 
 *                                        Requires commit of insert- and remove operation. 
 *                                        Off by default.
 * @param {Object} [config.debug] Set database in debug mode. Off by default.
 */
function JSONDatabase(config) {
    "use strict";
	var db_engine, param;
    
	// Merge default configuration settings with provided config
	this.config = {path: './database.json', transactional: false, debug: false};
    
	for(param in  config) {
		if(config.hasOwnProperty(param)) {
			this.config[param] = config[param];
		}
	}

	// Initialize JSORM database engine
	db_engine = require('./../../lib/jsorm13/jsormdb-src');
	this.db = db_engine.JSORM.db.db({parser: db_engine.JSORM.db.parser.json(), writeMode: db_engine.JSORM.db.db.modes.replace});
	
	// Read data file and insert contents in database engine
	try{
        this.db.insert(JSON.parse(require('fs').readFileSync(this.config.path, 'utf-8')));
	} catch(err) {}
}

/**
 * Insert an arbitrary number of records into the database.
 *
 * @param {Object[]} data. The records to be inserted, an array of JavaScript objects
 */
JSONDatabase.prototype.insert = function(data) {
    "use strict";
	this.db.insert(data);
	
	// in case no transaction support is required, commit changes immediately
	if(!this.config.transactional) {
		this.commit();
	}
};

/**
 * Remove records from the database.
 * 
 * @param {Object} query. Parameters for the removal.
 * @param {Object} [query.where] Search term, either primitive or composite, to determine which records to remove.
 */
JSONDatabase.prototype.remove = function(query) {
    "use strict";
	this.db.remove(query);
	
	// in case no transaction support is required, commit changes immediately
	if(!this.config.transactional) {
		this.commit();
	}
};

/**
 * Search by query. Returns an array of records. 
 * No matches will return an empty array; invalid query will return null.
 *
 * @param {Object} query. Search parameters
 * @param {Object} query.where. Proper query term, either composite or primitive
 * @param {Object} [query.fields] Fields to return. This is an object literal. 
 *                                All fields that are set to non-null and 
 *                                have a match will return those fields. 
 *                                Returns all fields if null.
 * @returns {Object[]} Array of the matched records
 */ 
JSONDatabase.prototype.query = function(query) {
    "use strict";
	var results = this.db.find(query);

	return results;
};

/**
 * Rollback a transaction. If given a count, it will reject the last count activities. 
 * If given no count, a count of 0, or a count greater than the total number of activities 
 * in this transaction, it will reject the entire transaction.
 * 
 * @param {Integer} count. Number of steps within the transaction to reject. 
 *                         If empty, 0, or greater than the total number of steps, 
 *                         the entire transaction will be rejected.
 */
JSONDatabase.prototype.rollback = function(count) {
    "use strict";
	// rollback changes to database since last commit, load, or db creation
	this.db.reject();
};

/**
 * Commit the current transaction.
 */
JSONDatabase.prototype.commit = function() {
    "use strict";
	// commit changes to database since last commit, load, or db creation
	this.db.commit();
	
	// stringify content of database and write to filesystem
	var content = JSON.stringify(this.db.find(), null, 4);
	require('fs').writeFileSync(this.config.path, content);
};

exports.JSONDatabase = JSONDatabase;
