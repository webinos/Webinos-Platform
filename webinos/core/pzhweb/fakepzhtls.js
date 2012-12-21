var util = require('util');

var fakepzh = exports;

fakepzh.send = function( user, message, callback ) {
    if (!isValidUser(user)) {
        callback.err(getUserError(user));
        return;
    }
    if (!isValidMessage(message)) {
        callback.err(getMessageError(message));
        return;
    }
    processMessage(user, message, callback);    
}

function processMessage(user, message, callback) {
    if (messageTypes.hasOwnProperty(message.type)) {
        messageTypes[message.type].apply(this, [user, message, callback]);  
    } else {
        callback.err(getNotSupportedError(message));
    }   
}


function isValidUser(user) {
    return true;
}

function isValidMessage(message) {
    return true;
}


function getUserError(user) {
    return {
        type: "invalid user",
        message: "invalid user: " + user
    };
}

function getMessageError(msg) {
    return {
        type: "invalid message",
        message: "invalid message: " + util.inspect(msg)
    };
}

function getNotSupportedError(msg) {
    return {
        type: "not supported",
        message: "not supported message type: " + util.inspect(msg)
    };
}

var messageTypes = {
    "getZoneStatus"         : getZoneStatus,
    "getUserDetails"        : getUserDetails,
    "getCrashLog"           : getCrashLog,
    "getInfoLog"            : getInfoLog,
    "getPzps"               : getPzps,
    "addPzp"                : addPzp,
    "revokePzp"             : revokePzp,
    "listAllServices"       : listAllServices,
    "listUnregServices"     : listUnregServices,
    "registerService"       : registerService,
    "unregisterService"     : unregisterService,
    "certificates"          : getCertificates,
    "setExpectedExternal"   : setExpectedExternal,
    "requestAddFriend"      : requestAddFriend,
    "getExpectedExternal"   : isExternalExpected,
    "approveFriend"         : approveFriendRequest,
    "rejectFriend"          : rejectFriendRequest
}

function getUserName(userObj) {
    if (userObj.hasOwnProperty("fullname")) {
        return userObj.fullname;
    } else if (userObj.hasOwnProperty("displayName") && (userObj.displayName !== 'undefined undefined')) {
        return userObj.displayName;
    } else if (userObj.hasOwnProperty("nickname")) {
        return userObj.nickname;
    } else if (userObj.hasOwnProperty("externalUser")) {
        return userObj.externalUser;
    } else if (userObj.hasOwnProperty("externalEmail")) {
        return userObj.externalEmail;
    } else if (userObj.hasOwnProperty("emails")) {
        return userObj.emails[0].value;
    } else {
        return util.inspect(userObj);
    }
}

function approveFriendRequest(user, message, callback) {
    if (isExternalExpectedInner(user, message.externalEmail)) {
        console.log("Approving friend request by " + getUserName(message.externalEmail) + " for " + getUserName(user));
    }
}

function rejectFriendRequest(user, message, callback) {
    if (isExternalExpectedInner(user, message.externalEmail)) {
        console.log("Rejecting friend request by " + getUserName(message.externalEmail) + " for " + getUserName(user));
    }
}

function isExternalExpectedInner(user, email) {
    return true;
}

//is the given message.externalEmail expected?
function isExternalExpected(user, message, callback) {
    console.log("Is " + getUserName(user) + " expecting to be asked to approve access to " + message.externalEmail + "? ... Yes");
    callback.success(isExternalExpectedInner(user, message.externalEmail));
}

function requestAddFriend(user, message, callback) {
    console.log("PZH TLS Server is now aware that the user " + getUserName(message.externalUser) + " with PZH details : " + util.inspect( message.externalPzh) + " has been authenticated and would like to be added to the list of trusted users to " + getUserName(user) + "'s zone");
}

function setExpectedExternal(user, message, callback) {
    console.log(getUserName(user) + " is now expecting external connection from " + util.inspect(message));
}

function getCertificates(user, message, callback) {
    callback.success({
        "provider" : "provider-cert-data",
        "server"   : "pzh-tls-server-cert-data"
    });
}

function listAllServices(user, message, callback) {
    callback.success({
       "pzEntityList": [{pzId:"John's laptop"}],
       "services"   : [ 
            {id: "1", api: "geolocation", serviceAddress: "address" }, 
            {id: "2", api: "events", serviceAddress: "place" },             
       ]
    });   
}

function listUnregServices(user, message, callback) {
    callback.success({
       "pzEntityId": "John's laptop",
       "modules"   : [ {name:"foo"}, {name:"bar"}, {name:"baz"} ]
    });   
}

function registerService(user, message, callback) {
    callback.success({});
}

function unregisterService(user, message, callback) {
    callback.success({});    
}


function addPzp(user, message, callback) {
    callback.success({
        img  : "http://www.wzone.com/myimages/PageNotFound-Man.jpg",
        code : "1234",
        err  : null
    })
}

function revokePzp(user, message, callback) {
    callback.success("John's stolen phone");
}


function getPzps(user, message, callback) {
    callback.success({
        signedCert : [{id : "John's PC", url:"John's PC", isConnected: false}, {id : "John's Tablet",url : "John's Tablet", isConnected: true}],
        revokedCert : [{id : "John's stolen phone", url:"John's stolen phone", isConnected: false}],
    });
}

function getZoneStatus(user, message, callback) {
    callback.success({
        pzps : [{id : "John's PC", isConnected: false}, {id : "John's Tablet", isConnected: true}],
        pzhs : [{id : "Alice's PZH", isConnected: true}, {id : "Bob's PZH", isConnected: false}]
    });
}

function getUserDetails(user, message, callback) {
    user.server = "The incredible webinos PZH";
    callback.success(user);
}

function getCrashLog(user, message, callback) {
    callback.success("This PZH has never crashed");
}

function getInfoLog(user, message, callback) {
    callback.success("This PZH has never had any information");
}

