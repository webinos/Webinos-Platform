{
  'targets': 
  [
    {
      # Needed declarations for the target
      'target_name': 'bluetooth',
     
     'conditions': [
        [ 'OS=="freebsd" or OS=="openbsd" or OS=="solaris" or (OS=="linux")', {
          'sources': [ "bluetooth.cc" ],
          'libraries': ['-lopenobex', '-lobexftp', '-lbluetooth'],
          'cflags':['-std=gnu++0x'] ,
        },
        ],
		[ 'OS=="win"', {
		  'sources': [            
			'bluetooth_NotImplemented.cc',
		  ],
        }]
      ],
    },
  ] # end targets
}

