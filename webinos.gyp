{
  'variables': {
    'node_root': '/home/SERILOCAL/habib.virji/node',
    'curr_dir': '/home/SERILOCAL/habib.virji/Webinos-Platform',
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
      '<@(node_root)/src/node.js',
      '<@(node_root)/lib/_debugger.js',
      '<@(node_root)/lib/_linklist.js',
      '<@(node_root)/lib/assert.js',
      '<@(node_root)/lib/buffer.js',
      '<@(node_root)/lib/buffer_ieee754.js',
      '<@(node_root)/lib/child_process.js',
      '<@(node_root)/lib/console.js',
      '<@(node_root)/lib/constants.js',
      '<@(node_root)/lib/crypto.js',
      '<@(node_root)/lib/cluster.js',
      '<@(node_root)/lib/dgram.js',
      '<@(node_root)/lib/dns.js',
      '<@(node_root)/lib/events.js',
      '<@(node_root)/lib/freelist.js',
      '<@(node_root)/lib/fs.js',
      '<@(node_root)/lib/http.js',
      '<@(node_root)/lib/https.js',
      '<@(node_root)/lib/module.js',
      '<@(node_root)/lib/net.js',
      '<@(node_root)/lib/os.js',
      '<@(node_root)/lib/path.js',
      '<@(node_root)/lib/punycode.js',
      '<@(node_root)/lib/querystring.js',
      '<@(node_root)/lib/readline.js',
      '<@(node_root)/lib/repl.js',
      '<@(node_root)/lib/stream.js',
      '<@(node_root)/lib/string_decoder.js',
      '<@(node_root)/lib/sys.js',
      '<@(node_root)/lib/timers.js',
      '<@(node_root)/lib/tls.js',
      '<@(node_root)/lib/tty.js',
      '<@(node_root)/lib/url.js',
      '<@(node_root)/lib/util.js',
      '<@(node_root)/lib/vm.js',
      '<@(node_root)/lib/zlib.js',
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
      #'<@(curr_dir)/demo/_third_party_main.js',
    ],
    'input': [
        '../node/src/fs_event_wrap.cc',
        '../node/src/cares_wrap.cc',
        '../node/src/handle_wrap.cc',
        '../node/src/node.cc',
        '../node/src/node_buffer.cc',
        '../node/src/node_constants.cc',
        '../node/src/node_extensions.cc',
        '../node/src/node_file.cc',
        '../node/src/node_http_parser.cc',
        '../node/src/node_javascript.cc',
        '../node/src/node_main.cc',
        '../node/src/node_os.cc',
        '../node/src/node_script.cc',
        '../node/src/node_string.cc',
        '../node/src/node_zlib.cc',
        '../node/src/pipe_wrap.cc',
        '../node/src/stream_wrap.cc',
        '../node/src/tcp_wrap.cc',
        '../node/src/timer_wrap.cc',
        '../node/src/tty_wrap.cc',
        '../node/src/process_wrap.cc',
        '../node/src/v8_typed_array.cc',
        '../node/src/udp_wrap.cc',
        # headers to make for a more pleasant IDE experience
        '../node/src/handle_wrap.h',
        '../node/src/node.h',
        '../node/src/node_buffer.h',
        '../node/src/node_constants.h',
        '../node/src/node_crypto.h',
        '../node/src/node_extensions.h',
        '../node/src/node_file.h',
        '../node/src/node_http_parser.h',
        '../node/src/node_javascript.h',
        '../node/src/node_os.h',
        '../node/src/node_root_certs.h',
        '../node/src/node_script.h',
        '../node/src/node_string.h',
        '../node/src/node_version.h',
        '../node/src/pipe_wrap.h',
        '../node/src/req_wrap.h',
        '../node/src/stream_wrap.h',
        '../node/src/v8_typed_array.h',
        '<@(node_root)/deps/http_parser/http_parser.h',
        # javascript files to make for an even more pleasant IDE experience
        '<@(library_files)',
      ],
  },

  'targets': [
    {
      'target_name': 'webinos',
      'type': 'executable',

      'dependencies': [
        '<@(node_root)/deps/http_parser/http_parser.gyp:http_parser',
        '<@(node_root)/deps/uv/uv.gyp:uv',
        'node_js2c#host',
      ],

      'include_dirs': [
        '../node/src',
        '../node/deps/uv/src/ares',
        '<(SHARED_INTERMEDIATE_DIR)' # for node_natives.h
      ],

      'sources':[
        "common/manager/certificate_manager/src/certificate_manager.cpp",
        "common/manager/certificate_manager/src/openssl_wrapper.cpp",
        "<@(input)",
        '<(SHARED_INTERMEDIATE_DIR)/node_natives.h',
        # node.gyp is added to the project by default.
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
          'sources': [ '../node/src/node_crypto.cc' ],
          'conditions': [
            [ 'node_use_system_openssl=="false"', {
              'dependencies': [ '<@(node_root)/deps/openssl/openssl.gyp:openssl' ],
            }]]
        }, {
          'defines': [ 'HAVE_OPENSSL=0' ]
        }],

        [ 'node_use_dtrace=="true"', {
          'sources': [
            '../node/src/node_dtrace.cc',
            '../node/src/node_dtrace.h',
            # why does node_provider.h get generated into src and not
            # SHARED_INTERMEDIATE_DIR?
            '../node/src/node_provider.h',
          ],
        }],

        [ 'node_shared_v8=="true"', {
          'sources': [
            '<(node_shared_v8_includes)/v8.h',
            '<(node_shared_v8_includes)/v8-debug.h',
          ],
        }, {
          'sources': [
            '<@(node_root)/deps/v8/include/v8.h',
            '<@(node_root)/deps/v8/include/v8-debug.h',
          ],
          'dependencies': [ '<@(node_root)/deps/v8/tools/gyp/v8.gyp:v8' ],
        }],

        [ 'node_shared_zlib=="false"', {
          'dependencies': [ '<@(node_root)/deps/zlib/zlib.gyp:zlib' ],
        }],

        [ 'OS=="win"', {
          'sources': [
            'tools/msvs/res/node.rc',
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
            '../node/src/node_signal_watcher.cc',
            '../node/src/node_stat_watcher.cc',
            '../node/src/node_io_watcher.cc',
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
            '<@(node_root)/tools/js2c.py',
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
                '<@(node_root)/tools/js2c.py',
                '<@(_outputs)',
                '<@(library_files)'
              ],
            }, { # No Dtrace
              'action': [
                'python',
                '<@(node_root)/tools/js2c.py',
                '<@(_outputs)',
                '<@(library_files)',
                '<@(node_root)/src/macros.py'
              ],
            }]
          ],
        },
      ],
    }, # end node_js2c
  ] # end targets
}

