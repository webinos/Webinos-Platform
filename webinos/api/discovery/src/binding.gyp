{
  'targets': 
  [
    {
      # Needed declarations for the target
      'target_name': 'bluetooth',
      'sources': [ #Specify your source files here
        "bluetooth.cc",
      ],
     'conditions': [
        [ 'OS=="freebsd" or OS=="openbsd" or OS=="solaris" or (OS=="linux" and target_arch!="ia32")', {
          'libraries': ['-lopenobex', '-lobexftp', '-lbluetooth'],
          'cflags':['-std=gnu++0x'] ,
        },
        ],
      ],
    },
  ] # end targets
}

