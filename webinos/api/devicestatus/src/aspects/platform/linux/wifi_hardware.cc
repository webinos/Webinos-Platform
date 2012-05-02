#include "../../wifi_hardware.h"
#include "../../../utils.h"
#include "string"

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
}

string WiFiHardware::status(string wifiHardwareName)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("iwconfig"));
	pos = line.find("Access Point") + 14;
	pos_endl = line.find(' ', pos);
	
	return "Associated to: " + line.substr (pos, pos_endl - pos);
}


            
