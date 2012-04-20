{
  'variables': {
    'v8_use_snapshot%': 'true',
    # Turn off -Werror in V8
    # See http://codereview.chromium.org/8159015
    'werror': '',
    'node_use_dtrace': 'false',
    'node_shared_v8%': 'false',
    'node_shared_zlib%': 'false',
    'node_use_openssl%': 'true',
    'node_use_system_openssl%': 'false',
  },

  'targets': [
    {
      'target_name':'webinos',
      'type': 'executable',

      'dependencies': [
        '<@(node_root)/node.gyp:node'
      ],

      'include_dirs': [
        'webinos/api/contacts/contrib',
        'webinos/common/manager/policy_manager/src/core',
        'webinos/common/manager/policy_manager/src/core/policymanager',
      ],

      'sources':[
        #Certificate manager
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
   }
  ] # end targets
}

