#include "../../wired_network.h"
#include "../../../utils.h"
#include "string"
#include "iostream"
#include "fstream"
#include "sstream"

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

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string WiredNetwork::networkStatus(string wiredNetworkComponent)
{
        return "networkStatus";
}

string WiredNetwork::ipAddress(string wiredNetworkComponent)
{
        return "ipAddress";
}

string WiredNetwork::macAddress(string wiredNetworkComponent)
{
	return "macAddress";
}
