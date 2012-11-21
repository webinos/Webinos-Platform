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

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string WiFiNetwork::ssid(string wifiNetworkComponent)
{
	return "ssid";
}

string WiFiNetwork::signalStrength(string wifiNetworkComponent)
{
        return "signalStrength";
}

string WiFiNetwork::networkStatus(string wifiNetworkComponent)
{
        return "networkStatus";
}

string WiFiNetwork::ipAddress(string wifiNetworkComponent)
{
	return "ipAddress";
}

string WiFiNetwork::macAddress(string wifiNetworkComponent)
{
        return "macAddress";
}
