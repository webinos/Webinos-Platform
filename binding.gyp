{
  'targets': [
    {
    'target_name':'webinos',
    'dependencies': [
      'webinos/core/manager/certificate_manager/src/binding.gyp:certificate_manager',
      'webinos/core/manager/policy_manager/src/binding.gyp:pm',
      'webinos/core/manager/keystore/src/binding.gyp:keystore',
      'webinos/core/api/contacts/src/binding.gyp:localcontacts',
      'webinos/core/api/devicestatus/src/binding.gyp:devicestatus',
      'webinos_wrt#host',
      'webinos/core/api/discovery/src/binding.gyp:bluetooth',
      'webinos/core/manager/policy_manager/src/promptMan/binding.gyp:promptMan',
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
          'build/Release/promptMan.node',
        ],
        'destination': 'node_modules/',
      }],
    }, # end webinos_wrt
  ], 
}
