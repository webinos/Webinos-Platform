{
  'variables': {
    'module_name': 'localcontacts',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
  },
  'targets': [
    {
	  # Needed declarations for the target
	  'target_name': '<(module_name)',
	  'product_name':'<(module_name)',
	  'sources': [ #Specify your source files here
			'thunderbird_AB_parser/MorkAddressBook.cpp',
			'../contrib/MorkParser.cpp',
			'thunderbird_AB_parser/node_contacts_mork.cpp',
		],
		'include_dirs': [
		   '../contrib',
		],
		'conditions': [
			[ 'OS=="win"', {
				'defines': [
					# We need to use node's preferred "win32" rather than gyp's preferred "win"
					'uint=unsigned int',
				],
			 },
			],
		],
    },
  ] # end targets
}

