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
				'sources': [
					'aspects/platform/linux/battery.cc',
					'aspects/platform/linux/cpu.cc',
					'aspects/platform/linux/device.cc',
					'aspects/platform/linux/display.cc',
					'aspects/platform/linux/input_device.cc',
					'aspects/platform/linux/memory_unit.cc',
					'aspects/platform/linux/operating_system.cc',
					'aspects/platform/linux/wifi_hardware.cc',
					'aspects/platform/linux/wifi_network.cc',
					'aspects/platform/linux/wired_network.cc'
				]
			}],
			[ 'OS=="win"', {
				'defines': ['OS_WIN'],
				'sources': [
					'aspects/platform/win/battery.cc',
					'aspects/platform/win/cpu.cc',
					'aspects/platform/win/device.cc',
					'aspects/platform/win/display.cc',
					'aspects/platform/win/input_device.cc',
					'aspects/platform/win/memory_unit.cc',
					'aspects/platform/win/operating_system.cc',
					'aspects/platform/win/wifi_hardware.cc',
					'aspects/platform/win/wired_network.cc'
				]
			 }],
			[ 'OS=="mac"', {
				'defines': ['OS_LINUX'],
				'sources': [
					'aspects/platform/mac/battery.cc',
					'aspects/platform/mac/camera.cc',
					'aspects/platform/mac/cellular_hardware.cc',
					'aspects/platform/mac/cellular_network.cc',
					'aspects/platform/mac/cpu.cc',
					'aspects/platform/mac/device.cc',
					'aspects/platform/mac/display.cc',
					'aspects/platform/mac/input_control.cc',
					'aspects/platform/mac/input_device.cc',
					'aspects/platform/mac/memory_unit.cc',
					'aspects/platform/mac/operating_system.cc',
					'aspects/platform/mac/parental_rating.cc',
					'aspects/platform/mac/web_runtime.cc',
					'aspects/platform/mac/wifi_hardware.cc',
					'aspects/platform/mac/wifi_network.cc',
					'aspects/platform/mac/wired_network.cc'
				]
			 }],

		],
    },
  ] # end targets
}

