#include "../../device.h"
#include "../../../utils.h"

AspectsRegister Device::aspectsRegister("Device", getInstance());

Device * Device::device = 0;

Device * Device::getInstance() {
	if ( device == 0 )
		device = new Device();
	return device;
}

vector<string> Device::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool Device::isSupported(string * property)
{
	return true;
}

string Device::getPropertyValue(string * property, string * component)
{
	if (*property == "imei")
		return imei(*component);

	if (*property == "model")
		return model(*component);

	if (*property == "vendor")
		return vendor(*component);

	if (*property == "version")
		return version(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string Device::imei(string deviceComponent)
{
	return "imei";
}

string Device::model(string deviceComponent)
{
	return "model";
}

string Device::version(string deviceComponent)
{
	return "version";
}

string Device::vendor(string deviceComponent)
{
	return "vendor";
}
