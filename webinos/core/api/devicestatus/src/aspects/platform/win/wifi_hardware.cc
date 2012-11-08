#include "../../wifi_hardware.h"
#include "../../../utils.h"

AspectsRegister WiFiHardware::aspectsRegister("WiFiHardware", getInstance());

WiFiHardware * WiFiHardware::wifiHardware = 0;

WiFiHardware * WiFiHardware::getInstance() {
	if ( wifiHardware == 0 )
		wifiHardware = new WiFiHardware();
	return wifiHardware;
}

vector<string> WiFiHardware::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool WiFiHardware::isSupported(string * property)
{
	return true;
}

string WiFiHardware::getPropertyValue(string * property, string * component)
{
	if (*property == "status")
		return status(*component);
}

string WiFiHardware::status(string res)
{
    res = Utils::WmiParam(L"Status", "SELECT * FROM Win32_NetworkAdapter");
	string res1; 
	size_t pos;
	pos = res.find("-");
	res1 = res.substr (10,10);
        	
    //string res = Utils::WmiParam(L"ConnectionState", "SELECT * FROM Win32_NetworkConnection");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	//string res3 = Utils::WmiParam(L"Name", "SELECT * FROM Win32_NetworkAdapter");
	//string res = Utils::WmiParam(L"AdapterType", "SELECT * FROM Win32_NetworkAdapter");
	//string res = res1 + res2 + res3;
	return res1;
	//return "language";
}
