{
  'variables': {
    'module_name': 'helloworld',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
  },
  'targets': [
    {
		# Needed declarations for the target
		'target_name': '<(module_name)',
		'product_name':'<(module_name)',
		'sources': [ #Specify your source files here
			'HelloWorld.cpp',
		],
	  
		'include_dirs': [ #You may specify additional include dirs here
		],
		'defines': [ # and additional defines. You can basicaly override anything located in the node_module.gypi file
		],
    },
  ] # end targets
}

