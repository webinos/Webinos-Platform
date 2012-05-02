#include "../../battery.h"
#include "../../../utils.h"

AspectsRegister Battery::aspectsRegister("Battery", getInstance());

Battery * Battery::battery = 0;

Battery * Battery::getInstance() {
	if ( battery == 0 )
		battery = new Battery();
	return battery;
}

vector<string> Battery::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");
	
	string res = Utils::WmiParam(L"DeviceID", "SELECT * FROM Win32_Battery");
	
	int pos, lastpos = 0;
	string component;
	
	while ( (pos = res.find('\n',lastpos)) != string::npos)
	{
		component = "BAT" + res.substr(lastpos, pos-lastpos);
		components.insert(components.end(), component.c_str());
		lastpos = pos+1;
	}

	component = "BAT" + res.substr(lastpos);
	components.insert(components.end(), component.c_str());

	return components;
}

bool Battery::isSupported(string * property)
{
	return true;
}

string Battery::getPropertyValue(string * property, string * component)
{
	if (*property == "batteryLevel")
		return batteryLevel(*component);

	if (*property == "batteryBeingCharged")
		return batteryBeingCharged(*component);
	
	return "Invalid property";
}

string Battery::batteryLevel(string batteryName)
{
	if (batteryName[0] == '_')
		batteryName = getComponents()[2];
		
	batteryName = batteryName.substr(3);
	
    return Utils::WmiParam(L"EstimatedChargeRemaining", "SELECT * FROM Win32_Battery WHERE DeviceID='" + batteryName + "'")	+ "%";
}

string Battery::batteryBeingCharged(string batteryName)
{
	if (batteryName[0] == '_')
		batteryName = getComponents()[2];
		
	batteryName = batteryName.substr(3);
		
    string res = Utils::WmiParam(L"BatteryStatus", "SELECT * FROM Win32_Battery WHERE DeviceID='" + batteryName + "'");
	
	if (res == "2" || res == "6" || res == "7" || res == "8" || res == "9")
		return "true";
	else
		return "false";
	
}
