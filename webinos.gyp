{
  'variables': {
    'v8_use_snapshot%': 'true',
    # Turn off -Werror in V8
    # See http://codereview.chromium.org/8159015
    'werror%': '',
    'node_use_dtrace%': 'false',
    'node_shared_v8%': 'false',
    'node_shared_zlib%': 'false',
    'node_use_openssl%': 'true',
    'node_staticlib%': 'true',
    'node_use_system_openssl%': 'false',
  },

  'targets': [
    {
      'target_name':'webinos',
      'type': 'executable',
      'variables': {'node_staticlib':'true'},
      'dependencies': [
        '<@(node_root)/node.gyp:node',
        'webinos_wrt#host',
      ],

      'include_dirs': [
        '<@(node_root)/src',
        '<@(node_root)/deps/uv/include',
        '<@(node_root)/deps/v8/include',
        'webinos/api/contacts/contrib',
        'webinos/common/manager/policy_manager/src/core',
        'webinos/common/manager/policy_manager/src/core/policymanager',
      ],

      'sources':[
        #Certificate manager
        "webinos_main.cc",
        "common/manager/certificate_manager/src/certificate_manager.cpp",
        "common/manager/certificate_manager/src/openssl_wrapper.cpp",

        #Discovery
        "api/discovery/src/bluetooth.cc",

        #Contacts
        "api/contacts/src/thunderbird_AB_parser/MorkAddressBook.cpp",
        "api/contacts/contrib/MorkParser.cpp",
        "api/contacts/src/thunderbird_AB_parser/node_contacts_mork.cpp",

        #Device status
        "api/devicestatus/src/nativedevicestatus.cc",
        "api/devicestatus/src/battery.cc",

        # Policy Manager
        "common/manager/policy_manager/src/pm.cc",
        "common/manager/policy_manager/src/core/policymanager/PolicyManager.cpp",
        "common/manager/policy_manager/src/core/policymanager/Condition.cpp",
        "common/manager/policy_manager/src/core/policymanager/Globals.cpp",
        "common/manager/policy_manager/src/core/policymanager/IPolicyBase.cpp",
        "common/manager/policy_manager/src/core/policymanager/Policy.cpp",
        "common/manager/policy_manager/src/core/policymanager/PolicySet.cpp",
        "common/manager/policy_manager/src/core/policymanager/Request.cpp",
        "common/manager/policy_manager/src/core/policymanager/Rule.cpp",
        "common/manager/policy_manager/src/core/policymanager/Subject.cpp",
        "common/manager/policy_manager/src/core/common.cpp",
        "common/manager/policy_manager/contrib/xmltools/tinyxml.cpp",
        "common/manager/policy_manager/contrib/xmltools/slre.cpp",
        "common/manager/policy_manager/contrib/xmltools/tinystr.cpp",
        "common/manager/policy_manager/contrib/xmltools/tinyxmlparser.cpp",
        "common/manager/policy_manager/contrib/xmltools/tinyxmlerror.cpp",

        'common.gypi',
       ],

      'defines': [
        'NODE_WANT_INTERNALS=1',
        'ARCH="<(target_arch)"',
        'PLATFORM="<(OS)"',         
      ],
   },
   {
      'target_name': 'webinos_wrt',
      'type': 'none',
      'toolsets': ['host'],
      'actions': [
        {
          'action_name': 'webinos_wrt',

          'inputs': [
            '<@(curr_dir)/tools/closure-compiler/compiler.jar',
          ],

          'outputs': [
            '<@(curr_dir)/webinos/test/client/webinos.js',
          ],

          # FIXME can the following conditions be shorted by just setting
          # macros.py into some variable which then gets included in the
          # action?
          'action': [
                'java',
                '-jar',
                '../tools/closure-compiler/compiler.jar',
                '--compilation_level',
                'WHITESPACE_ONLY',
                '--warning_level',
                'VERBOSE',
                "--js", "../webinos/common/rpc/lib/webinos_rpc.js",
                "--js", "../webinos/common/manager/messaging/lib/webinos_messagehandler.js",
                "--js", "../webinos/wrt/lib/webinos.session.js",
                "--js", "../webinos/wrt/lib/webinos.servicedisco.js",
                "--js", "../webinos/wrt/lib/webinos.js",
                "--js", "../webinos/common/rpc/lib/webinos_utils.js",
                "--js", "../webinos/api/file/lib/webinos.path.js",
                "--js", "../webinos/wrt/lib/webinos.file.js",
                "--js", "../webinos/wrt/lib/webinos.tv.js",
                "--js", "../webinos/wrt/lib/webinos.oauth.js",
                "--js", "../webinos/wrt/lib/webinos.get42.js",
                "--js", "../webinos/wrt/lib/webinos.geolocation.js",
                "--js", "../webinos/wrt/lib/webinos.sensors.js",
                "--js", "../webinos/wrt/lib/webinos.events.js",
		"--js", "../webinos/wrt/lib/webinos.applauncher.js",
		"--js", "../webinos/wrt/lib/webinos.vehicle.js",
		"--js", "../webinos/wrt/lib/webinos.deviceorientation.js",
                "--js", "../webinos/wrt/lib/webinos.devicestatus.js",
                "--js", "../webinos/wrt/lib/webinos.context.js",
                "--js", "../webinos/wrt/lib/webinos.contacts.js",
                "--js", "../webinos/wrt/lib/webinos.discovery.js",
                "--js", "../webinos/wrt/lib/webinos.authentication.js",
		"--js_output_file","<@(_outputs)", 

              ],
         }],     
    }, # end webinos_wrt
   ], 
}

