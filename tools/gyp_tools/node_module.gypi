#*******************************************************************************
#  Code contributed to the webinos project
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#  
#     http://www.apache.org/licenses/LICENSE-2.0
#  
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
# Copyright 2011 EPU - National Technical University of Athens
#*******************************************************************************
{
	'variables': {
		# These are required variables to make a proper node module build
		# MAC x64 will have to comment out all line in 
		# gyp\pylib\gyp\generator\make.py that contain append('-arch i386') (2 instances)
		# in order to make a proper 64 bit module
		'output_directory': 'build/Release', # The output dir resembles the old node-waf output in order to keep the old references
	},
	'target_defaults': {
		# Some default properties for all node modules
		'type': '<(library)', # Check https://github.com/joyent/node/pull/2337#r307547
		'product_extension':'node',
		'product_dir':'<(output_directory)',
		'product_prefix':'',# Remove the default lib prefix on each library

		'include_dirs': [
			'<(NODE_ROOT)/src',
			'<(NODE_ROOT)/deps/v8/include',
			'<(NODE_ROOT)/deps/uv/include',
		],

		'conditions': [
			[ 'OS=="win"', {
				'defines': [
					# We need to use node's preferred "win32" rather than gyp's preferred "win"
					'PLATFORM="win32"',
				],
				# We need to link to the node.lib file
				'libraries': [ '-l<(node_lib_file)' ],
				'msvs_configuration_attributes': {
					'OutputDirectory': '<(output_directory)',
					'IntermediateDirectory': '<(output_directory)/obj',
				},
				'msvs-settings': {
					'VCLinkerTool': {
						'SubSystem': 3, # /subsystem:dll
					},
				},
			}],
			[ 'OS=="mac"', {
				'libraries': [ # This specifies this library on both the compiler and the linker for make
					'-undefined dynamic_lookup',
				],
				'xcode_settings': { # This is the way to specify it for xcode
					'OTHER_LDFLAGS': [
						'-undefined dynamic_lookup'
					]
				},
				# Based on gyp's documentation, the following should be enough but it seems 
				# it doesn't work.
				# 'link_settings': {
				#	'ldflags': [
				#		‘-undefined dynamic_lookup’,
				#	],
				# },
			}],
		],
	}
}