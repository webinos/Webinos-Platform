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

string WiFiHardware::getPropertyValue(string * property, string *  component)
{
	if (*property == "status")
		return status(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string WiFiHardware::status(string wifiHardwareComponent)
{
	return "status";
}
