{
  'variables': {
    'module_name': 'certificate_manager',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
	#TODO: Fix this to include your own openssl lib
	'openssl_Root': 'C:/OpenSSL-Win32',
  },
  'targets': [
    {
	   # Needed declarations for the target
	   'target_name': '<(module_name)',
	   'product_name':'<(module_name)',
	    'sources': [ #Specify your source files here
			'certificate_manager.cpp',
			'openssl_wrapper.cpp',
		],
	  
		'conditions': [
        [ 'OS=="win"', {
		  #we need to link to the libeay32.lib
          'libraries': ['-l<(openssl_Root)/lib/libeay32.lib' ],
		  'include_dirs': [
		   '<(openssl_Root)/include',
		  ],
        }],
        [ 'OS!="win"', {
		  'libraries': [ #this is a hack to specify this linker option in make              
			'-lssl',
		  ],
        }],
      ],
    },
  ] # end targets
}

