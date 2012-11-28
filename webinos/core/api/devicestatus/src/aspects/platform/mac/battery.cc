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

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string Battery::batteryLevel(string batteryComponent)
{
	return "batteryBeingCharged";
}

string Battery::batteryBeingCharged(string batteryComponent)
{
	return "batteryBeingCharged";
}
