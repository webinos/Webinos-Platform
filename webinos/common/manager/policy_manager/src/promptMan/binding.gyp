{
  'variables': {
    'module_name': 'promptMan',#Specify the module name here
  },
  'targets': [
    {
	    # Needed declarations for the target
	    'target_name': '<(module_name)',
	    'product_name':'<(module_name)',
		'conditions': [
			[ 'OS=="darwin"', {
			  'sources': [            
				'promptMan_Darwin.cpp',
			  ],
			}],
			[ 'OS=="win"', {
			  'sources': [            
				'promptMan_Win.cpp',
			  ],
			}],
			[ 'OS=="linux"', {
			  'sources': [            
				'promptMan_Linux.cpp',
			  ],
			}],
		],
    },
  ] # end targets
}

