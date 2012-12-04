#include "../../wifi_network.h"
#include "../../../utils.h"
#include "string"
#include "iostream"
#include "fstream"
#include "sstream"

AspectsRegister WiFiNetwork::aspectsRegister("WiFiNetwork", getInstance());

WiFiNetwork * WiFiNetwork::wifiNetwork = 0;

WiFiNetwork * WiFiNetwork::getInstance() {
	if ( wifiNetwork == 0 )
		wifiNetwork = new WiFiNetwork();
	return wifiNetwork;
}

vector<string> WiFiNetwork::getComponents()
{

 vector<string> components;
        components.insert(components.end(), "_default");
        components.insert(components.end(), "_active");

        return components;
}



bool WiFiNetwork::isSupported(string * property)
{
	return true;
}

string WiFiNetwork::getPropertyValue(string * property, string *  component)
{
	if (*property == "ssid")
		return ssid(*component);
        if (*property == "signalStrength")
                return signalStrength(*component);
	if (*property == "networkStatus")
                return networkStatus(*component);
	if (*property == "ipAddress")
                return ipAddress(*component);
	if (*property == "macAddress")
                return macAddress(*component);

}

string WiFiNetwork::ssid(string wifiNetworkName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("iwconfig")); //cat proc/loadavg
 pos = line.find("ESSID");
 result = line.substr (pos);
 res = result.substr (6,10);
if (res == "ESSID")
{
 return string(res);
}
else 
 return "No ssid found";
}

string WiFiNetwork::signalStrength(string wifiNetworkName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("iwconfig")); //cat proc/loadavg
 pos = line.find("Tx-Power");
 result = line.substr (pos);
 res = result.substr (9,8);

 return string(res);
}

string WiFiNetwork::networkStatus(string wifiNetworkName)
{
        return "networkStatus not Implemented";
}

string WiFiNetwork::ipAddress(string wifiNetworkName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("ifconfig -a")); // iwconfig
 pos = line.find("inet addr");
 result = line.substr (pos);
 res = result.substr (10,27);

        return string(res);
}

string WiFiNetwork::macAddress(string wifiNetworkName)
{

string line, res, result;
size_t pos;

 line = Utils::exec(string("ifconfig -a")); //iwconfig
 pos = line.find("HWaddr");
 result = line.substr (pos);
 res = result.substr (7,20);

        return string(res);
}

            
