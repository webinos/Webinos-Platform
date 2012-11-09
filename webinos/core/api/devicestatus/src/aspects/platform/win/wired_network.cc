#include "../../wired_network.h"
#include "../../../utils.h"

AspectsRegister WiredNetwork::aspectsRegister("WiredNetwork", getInstance());

WiredNetwork * WiredNetwork::wiredNetwork = 0;

WiredNetwork * WiredNetwork::getInstance() {
	if ( wiredNetwork == 0 )
		wiredNetwork = new WiredNetwork();
	return wiredNetwork;
}

vector<string> WiredNetwork::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool WiredNetwork::isSupported(string * property)
{
	return true;
}

string WiredNetwork::getPropertyValue(string * property, string * component)
{
	if (*property == "networkStatus")
		return networkStatus(*component);

	if (*property == "ipAddress")
		return ipAddress(*component);

	if (*property == "macAddress")
		return macAddress(*component);
}

string WiredNetwork::networkStatus(string networkStatus)
{
    //string res; 
    string res = Utils::WmiParam(L"ConnectionState", "SELECT * FROM Win32_NetworkConnection");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	//size_t pos;
	//pos = res1.find("-");
	//res = res1.substr (10,10);
	return res;
}

string WiredNetwork::ipAddress(string ipAddress)
{
    string res; 
	string res1 = Utils::WmiParam(L"IPAddress", "SELECT * FROM Win32_NetworkAdapterConfiguration");
	size_t pos;
	pos = res1.find("-");
	res = res1.substr (0,12);
	//string res = Utils::WmiParam(L"Manufacturer", "SELECT * FROM Win32_NetworkAdapter");
	return res;
}

string WiredNetwork::macAddress(string macAddress)
{
    string res; 
	string res1 = Utils::WmiParam(L"MACAddress", "SELECT * FROM Win32_NetworkAdapter");
	size_t pos;
	pos = res1.find("-");
	res = res1.substr (76,20);
	return res;
}

