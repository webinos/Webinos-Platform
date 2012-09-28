{
  'targets': [
    {
    'target_name':'webinos',
    'dependencies': [
      'webinos/common/manager/certificate_manager/src/binding.gyp:certificate_manager',
      'webinos/common/manager/policy_manager/src/binding.gyp:pm',
      'webinos/common/manager/keystore/src/binding.gyp:keystore',
      'webinos/api/contacts/src/binding.gyp:localcontacts',
      'webinos/api/devicestatus/src/binding.gyp:devicestatus',
      'webinos_wrt#host',
      'webinos/api/discovery/src/binding.gyp:bluetooth',
    ],
    'conditions': [ 
      [ 'OS=="win"', {
        'dependencies': [ # Prompt man is only implemented on windows
            'webinos/common/manager/policy_manager/src/promptMan/binding.gyp:promptMan',
          ],
        },
      ],
    ],
   },
   {
    'target_name': 'webinos_wrt',
    'type': 'none',
    'toolsets': ['host'],
    'copies': [
      {
        'files': [
          'build/Release/certificate_manager.node',
          'build/Release/keystore.node',
          'build/Release/localcontacts.node',
          'build/Release/bluetooth.node',
          'build/Release/nativedevicestatus.node',
          'build/Release/pm.node',
        ],
        'destination': 'node_modules/',
      }],
    'conditions': [ 
        [ 'OS=="win"', {
            'copies': [{
                'files': [
                    'build/Release/promptMan.node',
            ],
            'destination': 'node_modules/',
            }],
        },
        ],
    ],
    }, # end webinos_wrt
  ], 
}
