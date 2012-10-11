{
  'variables': {
    'openssl_Root': 'C:/OpenSSL-Win32',
  },
  'targets': 
  [
    {
       # Needed declarations for the target
      'target_name': 'certificate_manager',
      'product_name': 'certificate_manager',
        'sources': [ #Specify your source files here
          'certificate_manager.cpp',
          'openssl_wrapper.cpp',
        ],
      
      'conditions': [
        [ 'OS=="win"', {
          #we need to link to the libeay32.lib
          'libraries': ['-l<(openssl_Root)/lib/libeay32.lib' ],
          'include_dirs': ['<(openssl_Root)/include'],
        }],
        [ 'OS=="freebsd" or OS=="openbsd" or OS=="mac" or OS=="solaris" or OS=="linux"', {
          'libraries': ['-lssl', '-lcrypto'],
        }],
      ],  
    },
  ] # end targets
}

