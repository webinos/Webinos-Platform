{
  'variables': {
    'v8_use_snapshot%': 'true',
    # Turn off -Werror in V8
    # See http://codereview.chromium.org/8159015
    'werror': '',
    'node_use_dtrace': 'false',
    'node_shared_v8%': 'false',
    'node_shared_zlib%': 'false',
    'node_use_openssl%': 'true',
    'node_use_system_openssl%': 'false',
    'library_files': [
      '<(curr_dir)/deps/node/src/node.js',
      '<(curr_dir)/deps/node/lib/_debugger.js',
      '<(curr_dir)/deps/node/lib/_linklist.js',
      '<(curr_dir)/deps/node/lib/assert.js',
      '<(curr_dir)/deps/node/lib/buffer.js',
      '<(curr_dir)/deps/node/lib/buffer_ieee754.js',
      '<(curr_dir)/deps/node/lib/child_process.js',
      '<(curr_dir)/deps/node/lib/console.js',
      '<(curr_dir)/deps/node/lib/constants.js',
      '<(curr_dir)/deps/node/lib/crypto.js',
      '<(curr_dir)/deps/node/lib/cluster.js',
      '<(curr_dir)/deps/node/lib/dgram.js',
      '<(curr_dir)/deps/node/lib/dns.js',
      '<(curr_dir)/deps/node/lib/events.js',
      '<(curr_dir)/deps/node/lib/freelist.js',
      '<(curr_dir)/deps/node/lib/fs.js',
      '<(curr_dir)/deps/node/lib/http.js',
      '<(curr_dir)/deps/node/lib/https.js',
      '<(curr_dir)/deps/node/lib/module.js',
      '<(curr_dir)/deps/node/lib/net.js',
      '<(curr_dir)/deps/node/lib/os.js',
      '<(curr_dir)/deps/node/lib/path.js',
      '<(curr_dir)/deps/node/lib/punycode.js',
      '<(curr_dir)/deps/node/lib/querystring.js',
      '<(curr_dir)/deps/node/lib/readline.js',
      '<(curr_dir)/deps/node/lib/repl.js',
      '<(curr_dir)/deps/node/lib/stream.js',
      '<(curr_dir)/deps/node/lib/string_decoder.js',
      '<(curr_dir)/deps/node/lib/sys.js',
      '<(curr_dir)/deps/node/lib/timers.js',
      '<(curr_dir)/deps/node/lib/tls.js',
      '<(curr_dir)/deps/node/lib/tty.js',
      '<(curr_dir)/deps/node/lib/url.js',
      '<(curr_dir)/deps/node/lib/util.js',
      '<(curr_dir)/deps/node/lib/vm.js',
      '<(curr_dir)/deps/node/lib/zlib.js',

      '<@(curr_dir)/webinos/pzh/lib/pzh_authcode.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_connecting.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_farm.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_internal_apis.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_qrcode.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_revoke.js',
      '<@(curr_dir)/webinos/pzh/lib/pzh_sessionHandling.js',
      '<@(curr_dir)/webinos/pzh/web/pzh_webserver.js',

      '<@(curr_dir)/webinos/pzp/lib/pzp_server.js',
      '<@(curr_dir)/webinos/pzp/lib/pzp_sessionHandling.js',
      '<@(curr_dir)/webinos/pzp/lib/pzp_websocket.js',
      '<@(curr_dir)/webinos/pzp/lib/session_certificate.js',
      '<@(curr_dir)/webinos/pzp/lib/session_common.js',
      '<@(curr_dir)/webinos/pzp/lib/session_configuration.js',
      '<@(curr_dir)/webinos/pzp/lib/session_schema.js',

      '<@(curr_dir)/webinos/common/rpc/lib/webinos_utils.js',
      '<@(curr_dir)/webinos/common/rpc/lib/rpc.js',

      '<@(curr_dir)/webinos/common/manager/messaging/lib/messagehandler.js',

    ],
  },

  'targets': [
    {
      'target_name': 'webinos',
      'type': 'executable',

      'dependencies': [
        'deps/node/deps/http_parser/http_parser.gyp:http_parser',
        'deps/node/deps/uv/uv.gyp:uv',
        'node_js2c#host',
      ],

      'include_dirs': [
        'deps/node/src',
        'deps/node/deps/uv/src/ares',
        #'webinos/api/contacts/contrib',
        '<(SHARED_INTERMEDIATE_DIR)' # for node_natives.h
      ],

      'sources':[
        "common/manager/certificate_manager/src/certificate_manager.cpp",
        "common/manager/certificate_manager/src/openssl_wrapper.cpp",
        #"common/manager/policy_manager/src/pm.cc",
        #"common/manager/policy_manager/src/core/policymanager/PolicyManager.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Condition.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Globals.cpp",
        #"common/manager/policy_manager/src/core/policymanager/IPolicyBase.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Policy.cpp",
        #"common/manager/policy_manager/src/core/policymanager/PolicySet.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Request.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Rule.cpp",
        #"common/manager/policy_manager/src/core/policymanager/Subject.cpp",
        #"common/manager/policy_manager/src/core/common.cpp",
        #"common/manager/policy_manager/contrib/xmltools/tinyxml.cpp",
        #"common/manager/policy_manager/contrib/xmltools/slre.cpp",
        #"common/manager/policy_manager/contrib/xmltools/tinystr.cpp",
        #"common/manager/policy_manager/contrib/xmltools/tinyxmlparser.cpp",
        #"common/manager/policy_manager/contrib/xmltools/tinyxmlerror.cpp",
        #"api/contacts/src/thunderbird_AB_parser/MorkAddressBook.cpp",
        #"api/contacts/contrib/MorkParser.cpp",
        #"api/contacts/src/thunderbird_AB_parser/node_contacts_mork.cpp",
        #"api/discovery/src/bluetooth.cc",
        'deps/node/src/fs_event_wrap.cc',
        'deps/node/src/cares_wrap.cc',
        'deps/node/src/handle_wrap.cc',
        'deps/node/src/node.cc',
        'deps/node/src/node_buffer.cc',
        'deps/node/src/node_constants.cc',
        'deps/node/src/node_extensions.cc',
        'deps/node/src/node_file.cc',
        'deps/node/src/node_http_parser.cc',
        'deps/node/src/node_javascript.cc',
        'deps/node/src/node_main.cc',
        'deps/node/src/node_os.cc',
        'deps/node/src/node_script.cc',
        'deps/node/src/node_string.cc',
        'deps/node/src/node_zlib.cc',
        'deps/node/src/pipe_wrap.cc',
        'deps/node/src/stream_wrap.cc',
        'deps/node/src/tcp_wrap.cc',
        'deps/node/src/timer_wrap.cc',
        'deps/node/src/tty_wrap.cc',
        'deps/node/src/process_wrap.cc',
        'deps/node/src/v8_typed_array.cc',
        'deps/node/src/udp_wrap.cc',
        # headers to make for a more pleasant IDE experience
        'deps/node/src/handle_wrap.h',
        'deps/node/src/node.h',
        'deps/node/src/node_buffer.h',
        'deps/node/src/node_constants.h',
        'deps/node/src/node_crypto.h',
        'deps/node/src/node_extensions.h',
        'deps/node/src/node_file.h',
        'deps/node/src/node_http_parser.h',
        'deps/node/src/node_javascript.h',
        'deps/node/src/node_os.h',
        'deps/node/src/node_root_certs.h',
        'deps/node/src/node_script.h',
        'deps/node/src/node_string.h',
        'deps/node/src/node_version.h',
        'deps/node/src/pipe_wrap.h',
        'deps/node/src/req_wrap.h',
        'deps/node/src/stream_wrap.h',
        'deps/node/src/v8_typed_array.h',
        'deps/node/deps/http_parser/http_parser.h',
        # javascript files to make for an even more pleasant IDE experience
        '<@(library_files)',
        '<(SHARED_INTERMEDIATE_DIR)/node_natives.h',        
        'common.gypi',
       ],

      'defines': [
        'NODE_WANT_INTERNALS=1',
        'ARCH="<(target_arch)"',
        'PLATFORM="<(OS)"',
      ],

      'conditions': [
        [ 'node_use_openssl=="true"', {
          'defines': [ 'HAVE_OPENSSL=1' ],
          'sources': [ 'deps/node/src/node_crypto.cc' ],
          'conditions': [
            [ 'node_use_system_openssl=="false"', {
              'dependencies': [ 'deps/node/deps/openssl/openssl.gyp:openssl' ],
            }]]
        }, {
          'defines': [ 'HAVE_OPENSSL=0' ]
        }],

        [ 'node_use_dtrace=="true"', {
          'sources': [
            'deps/node/node/src/node_dtrace.cc',
            'deps/node/node/src/node_dtrace.h',
            # why does node_provider.h get generated into src and not
            # SHARED_INTERMEDIATE_DIR?
            'deps/node/node/src/node_provider.h',
          ],
        }],

        [ 'node_shared_v8=="true"', {
          'sources': [
            '<(node_shared_v8_includes)/v8.h',
            '<(node_shared_v8_includes)/v8-debug.h',
          ],
        }, {
          'sources': [
            'deps/node/deps/v8/include/v8.h',
            'deps/node/deps/v8/include/v8-debug.h',
          ],
          'dependencies': [ 'deps/node/deps/v8/tools/gyp/v8.gyp:v8' ],
        }],

        [ 'node_shared_zlib=="false"', {
          'dependencies': [ 'deps/node/deps/zlib/zlib.gyp:zlib' ],
        }],

        [ 'OS=="win"', {
          'sources': [
            'deps/node/tools/msvs/res/node.rc',
          ],
          'defines': [
            'FD_SETSIZE=1024',
            # we need to use node's preferred "win32" rather than gyp's preferred "win"
            'PLATFORM="win32"',
            '_UNICODE=1',
          ],
          'libraries': [ '-lpsapi.lib' ]
        },{ # POSIX
          'defines': [ '__POSIX__' ],
          'sources': [
            'deps/node/src/node_signal_watcher.cc',
            'deps/node/src/node_stat_watcher.cc',
            'deps/node/src/node_io_watcher.cc',
          ]
        }],
        [ 'OS=="mac"', {
          'libraries': [ '-framework Carbon' ],
          'defines!': [
            'PLATFORM="mac"',
          ],
          'defines': [
            # we need to use node's preferred "darwin" rather than gyp's preferred "mac"
            'PLATFORM="darwin"',
          ],
        }],
        [ 'OS=="freebsd"', {
          'libraries': [
            '-lutil',
            '-lkvm',
          ],
        }],
        [ 'OS=="solaris"', {
          'libraries': [
            '-lkstat',
          ],
        }],
      ],
      'msvs-settings': {
        'VCLinkerTool': {
          'SubSystem': 1, # /subsystem:console
        },
      },
    },

    {
      'target_name': 'node_js2c',
      'type': 'none',
      'toolsets': ['host'],
      'actions': [
        {
          'action_name': 'node_js2c',

          'inputs': [
            '<@(curr_dir)/deps/node/tools/js2c.py',
            '<@(library_files)',
          ],

          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/node_natives.h',
          ],

          # FIXME can the following conditions be shorted by just setting
          # macros.py into some variable which then gets included in the
          # action?

          'conditions': [
            [ 'node_use_dtrace=="true"', {
              'action': [
                'python',
                '<@(curr_dir)/deps/node/tools/js2c.py',
                '<@(_outputs)',
                '<@(library_files)'
              ],
            }, { # No Dtrace
              'action': [
                'python',
                '<@(curr_dir)/deps/node/tools/js2c.py',
                '<@(_outputs)',
                '<@(library_files)',
                '<@(curr_dir)/deps/node/src/macros.py'
              ],
            }]
          ],
        },
      ],
    }, # end node_js2c
  ] # end targets
}

