#include "../../input_device.h"
//#include "../../../utils.h"

#include <windows.h>
#include <iostream>

AspectsRegister InputDevice::aspectsRegister("InputDevice", getInstance());

InputDevice * InputDevice::inputDevice = 0;

InputDevice * InputDevice::getInstance() {
	if ( inputDevice == 0 )
		inputDevice = new InputDevice();
	return inputDevice;
}

vector<string> InputDevice::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool InputDevice::isSupported(string * property)
{
	return true;
}

string InputDevice::getPropertyValue(string * property, string * component)
{
    if (*property == "type")
		return type(*component);
}

string InputDevice::type(string type)
{
    //string res = Utils::WmiParam(L"CIM_LogicalDevice", "SELECT * FROM Win32_PNPDeviceID");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	//return res;
	//return "language";
	//cout << "USB Device Lister." << endl;
 
    UINT nDevices = 0;
    GetRawInputDeviceList( NULL, &nDevices, sizeof( RAWINPUTDEVICELIST ) );
 
    if( nDevices < 1 )
    {
        cout << "ERR: 0 Devices?";
        cin.get();
        return 0;
    }
     
    PRAWINPUTDEVICELIST pRawInputDeviceList;
    pRawInputDeviceList = new RAWINPUTDEVICELIST[ sizeof( RAWINPUTDEVICELIST ) * nDevices ];
 
    if( pRawInputDeviceList == NULL )
    {
        cout << "ERR: Could not allocate memory for Device List.";
        cin.get();
        return 0;
    }
     
    int nResult;
    nResult = GetRawInputDeviceList( pRawInputDeviceList, &nDevices, sizeof( RAWINPUTDEVICELIST ) );
 
    if( nResult < 0 )
    {
        delete [] pRawInputDeviceList;
        cout << "ERR: Could not get device list.";
        cin.get();
        return 0;
    }
 
    for( UINT i = 0; i < nDevices; i++ )
    {
        UINT nBufferSize = 0;
        nResult = GetRawInputDeviceInfo( pRawInputDeviceList[i].hDevice, // Device
                                         RIDI_DEVICENAME,                // Get Device Name
                                         NULL,                           // NO Buff, Want Count!
                                         &nBufferSize );                 // Char Count Here!
 
        if( nResult < 0 )
        {
            cout << "ERR: Unable to get Device Name character count.. Moving to next device." << endl << endl;
            continue;
        }
 
        WCHAR* wcDeviceName = new WCHAR[ nBufferSize + 1 ];
         
        if( wcDeviceName == NULL )
        {
            cout << "ERR: Unable to allocate memory for Device Name.. Moving to next device." << endl << endl;
            continue;
        }
 
        nResult = GetRawInputDeviceInfo( pRawInputDeviceList[i].hDevice, // Device
                                         RIDI_DEVICENAME,                // Get Device Name
                                         wcDeviceName,                   // Get Name!
                                         &nBufferSize );                 // Char Count
 
        if( nResult < 0 )
        {
            cout << "ERR: Unable to get Device Name.. Moving to next device." << endl << endl;
 
            delete [] wcDeviceName;
 
            continue;
        }
 
        RID_DEVICE_INFO rdiDeviceInfo;
        rdiDeviceInfo.cbSize = sizeof( RID_DEVICE_INFO );
        nBufferSize = rdiDeviceInfo.cbSize;
 
        nResult = GetRawInputDeviceInfo( pRawInputDeviceList[i].hDevice,
                                         RIDI_DEVICEINFO,
                                         &rdiDeviceInfo,
                                         &nBufferSize );
 
        if( nResult < 0 )
        {
            cout << "ERR: Unable to read Device Info.. Moving to next device." << endl << endl;
 
            continue;
        }
 
        // Mouse
        if( rdiDeviceInfo.dwType == RIM_TYPEMOUSE )
        {
            cout << endl << "Displaying device " << i+1 << " information. (MOUSE)" << endl;
            wcout << L"Device Name: " << wcDeviceName << endl;
            cout << "Mouse ID: " << rdiDeviceInfo.mouse.dwId << endl;
            cout << "Mouse buttons: " << rdiDeviceInfo.mouse.dwNumberOfButtons << endl;
            cout << "Mouse sample rate (Data Points): " << rdiDeviceInfo.mouse.dwSampleRate << endl;
            if( rdiDeviceInfo.mouse.fHasHorizontalWheel )
            {
                cout << "Mouse has horizontal wheel" << endl;
            }
            else
            {
                cout << "Mouse does not have horizontal wheel" << endl;
            }
        }
 
        // Keyboard
        else if( rdiDeviceInfo.dwType == RIM_TYPEKEYBOARD )
        {
            // Current Device
            cout << endl << "Displaying device " << i+1 << " information. (KEYBOARD)" << endl;
            wcout << L"Device Name: " << wcDeviceName << endl;
            cout << "Keyboard mode: " << rdiDeviceInfo.keyboard.dwKeyboardMode << endl;
            cout << "Number of function keys: " << rdiDeviceInfo.keyboard.dwNumberOfFunctionKeys << endl;
            cout << "Number of indicators: " << rdiDeviceInfo.keyboard.dwNumberOfIndicators << endl;
            cout << "Number of keys total: " << rdiDeviceInfo.keyboard.dwNumberOfKeysTotal << endl;
            cout << "Type of the keyboard: " << rdiDeviceInfo.keyboard.dwType << endl;
            cout << "Subtype of the keyboard: " << rdiDeviceInfo.keyboard.dwSubType << endl;
        }
 
        // Some HID
        else // (rdi.dwType == RIM_TYPEHID)
        {
            // Current Device
            cout << endl << "Displaying device " << i+1 << " information. (HID)" << endl;
            wcout << L"Device Name: " << wcDeviceName << endl;
            cout << "Vendor Id:" << rdiDeviceInfo.hid.dwVendorId << endl;
            cout << "Product Id:" << rdiDeviceInfo.hid.dwProductId << endl;
            cout << "Version No:" << rdiDeviceInfo.hid.dwVersionNumber << endl;
            cout << "Usage for the device: " << rdiDeviceInfo.hid.usUsage << endl;
            cout << "Usage Page for the device: " << rdiDeviceInfo.hid.usUsagePage << endl;
        }
 
        // Delete Name Memory!
        delete [] wcDeviceName;
    }
 
    // Clean Up - Free Memory
    delete [] pRawInputDeviceList;
 
    // Exit
   // cout << endl << "Finnished.";
    //cin.get();
    //return res;

	
}
