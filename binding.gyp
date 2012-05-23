{
  'targets': [
    {
    'target_name':'webinos',
    'dependencies': [
      'webinos/common/manager/certificate_manager/binding.gyp:certificate_manager',
      'webinos/common/manager/policy_manager/src/binding.gyp:pm',
      'webinos/api/contacts/src/binding.gyp:localcontacts',
      'webinos/api/devicestatus/src/binding.gyp:devicestatus',
      'webinos_wrt#host',
    ],
    'conditions': [ 
      [ 'OS!="win"', {
        'dependencies': [
          'webinos/api/discovery/src/binding.gyp:bluetooth',
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
          'build/Release/localcontacts.node',
          'build/Release/bluetooth.node',
          'build/Release/nativedevicestatus.node',
          'build/Release/pm.node',
        ],
        'destination': 'node_modules/',
      }],
    }, # end webinos_wrt
  ], 
}
