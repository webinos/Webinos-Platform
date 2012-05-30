{
  'variables': {
    'module_name': 'keystore',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
  },
  'targets': [
    {
	    # Needed declarations for the target
	    'target_name': '<(module_name)',
	    'product_name':'<(module_name)',
		'sources': [ #Specify your source files here
			"ksImpl.cpp",
			"ksImpl.h",
			"KeyStoreException.h",
		],
		'conditions': [
        [ 'OS=="darwin"', {
		  'sources': [            
			'ksImpl_Darwin.cpp',
		  ],
          'libraries': ['-g','-framework','CoreFoundation','-framework','Security','-lssl','-lcrypto' ],
        }],
        [ 'OS=="win"', {
		  'sources': [            
			'ksImpl_NotImplemented.cpp',
		  ],
        }],
		[ 'OS=="linux"', {
		  'sources': [            
			'ksImpl_Linux.cpp',
		  ],
		  'libraries': ['--cflags --libs' ],
        }],
      ],
    },
  ] # end targets
}

