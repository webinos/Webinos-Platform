module.exports = {
    "pzh"       : require('./pzh/lib/webinos_pzh'),
    "pzp"       : require('./pzp/lib/webinos_pzp'),
    "session"   : require('./pzp/lib/webinos_session'),
    "rpc"       : require('./common/rpc/lib/rpc.js'),
    "utils"     : require('./common/rpc/lib/webinos_utils.js'),
    "messaging" : require('./common/manager/messaging/lib/webinos_messagehandler.js'),
    "context"   : require('./common/manager/context_manager/lib/webinos_context.js'),
    "policy"    : require('./common/manager/policy_manager/lib/webinos_policymanager.js'),
    "api"       : require('./api/webinos_api.js'),    
};
