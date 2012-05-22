{
  'targets': [
    {
    'target_name':'webinos',
    'dependencies': [
      'webinos/common/manager/certificate_manager/src/binding.gyp:certificate_manager',
      'webinos/common/manager/policy_manager/src/binding.gyp:pm',
      'webinos/api/contacts/src/binding.gyp:localcontacts',
      'webinos/api/devicestatus/src/binding.gyp:devicestatus',
      'webinos_wrt#host'
    ],
    'conditions': [ 
      [ 'OS=="freebsd" or OS=="openbsd" or OS=="solaris" or (OS=="linux" and target_arch!="ia32")', {
        'dependencies': [
          'webinos/api/discovery/src/binding.gyp:bluetooth'
          ],
        },
      ],
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
          './tools/closure-compiler/compiler.jar',
        ],

        'outputs': [
          './webinos/test/client/webinos.js',
        ],

        # FIXME can the following conditions be shorted by just setting
        # macros.py into some variable which then gets included in the
        # action?
        'action': [
          'java',
          '-jar',
          './tools/closure-compiler/compiler.jar',
          '--compilation_level',
          'WHITESPACE_ONLY',
          '--warning_level',
          'VERBOSE',
          "--js", "./webinos/common/rpc/lib/rpc.js",
          "--js", "./webinos/common/manager/messaging/lib/messagehandler.js",
          "--js", "./webinos/wrt/lib/webinos.session.js",
          "--js", "./webinos/wrt/lib/webinos.servicedisco.js",
          "--js", "./webinos/wrt/lib/webinos.js",
          "--js", "./webinos/common/rpc/lib/webinos.utils.js",
          "--js", "./webinos/api/file/lib/webinos.path.js",
          "--js", "./webinos/wrt/lib/webinos.file.js",
          "--js", "./webinos/wrt/lib/webinos.tv.js",
          "--js", "./webinos/wrt/lib/webinos.oauth.js",
          "--js", "./webinos/wrt/lib/webinos.get42.js",
          "--js", "./webinos/wrt/lib/webinos.geolocation.js",
          "--js", "./webinos/wrt/lib/webinos.sensors.js",
          "--js", "./webinos/wrt/lib/webinos.events.js",
          "--js", "./webinos/wrt/lib/webinos.applauncher.js",
          "--js", "./webinos/wrt/lib/webinos.vehicle.js",
          "--js", "./webinos/wrt/lib/webinos.deviceorientation.js",
          "--js", "./webinos/wrt/lib/webinos.devicestatus.js",
          "--js", "./webinos/wrt/lib/webinos.context.js",
          "--js", "./webinos/wrt/lib/webinos.contacts.js",
          "--js", "./webinos/wrt/lib/webinos.discovery.js",
          "--js", "./webinos/wrt/lib/webinos.authentication.js",
          "--js_output_file","<@(_outputs)",
        ],
        'action': [
          'cp', 
          './build/Release/certificate_manager.node',
          './build/Release/localcontacts.node',
          './build/Release/bluetooth.node',
          './build/Release/nativedevicestatus.node',
          './build/Release/pm.node',
          './node_modules/',
        ]
      }],
    }, # end webinos_wrt
  ], 
}
