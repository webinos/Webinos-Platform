{
  'variables': {
    'module_name': 'devicestatus',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
  },
  'targets': [
    {
	  # Needed declarations for the target
	  'target_name': '<(module_name)',
	  'product_name':'nativedevicestatus',
	  'sources': [ #Specify your source files here
			'nativedevicestatus.cc',
			'aspects.cc',
			'utils.cc',
		],
		'conditions': [
			['OS=="freebsd" or OS=="openbsd" or OS=="solaris" or (OS=="linux")', {
				'defines': ['OS_LINUX'],
				'sources': ['aspects/platform/linux/*.cc']
			}],
			[ 'OS=="win"', {
				'defines': ['OS_WIN'],
				'sources': ['aspects/platform/win/*.cc']
			 }],
		],
    },
  ] # end targets
}

