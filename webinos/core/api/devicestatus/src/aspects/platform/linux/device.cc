#include "../../device.h"
#include "../../../utils.h"
#include <string>
#include <iostream>
#include <fstream>
#include <sstream>

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

	if (*property == "version")
		return version(*component);

	if (*property == "vendor")
		return vendor(*component);

}

string Device::imei(string deviceName)
{
	return "imei";
}

string Device::model(string deviceName)
{
	return "model";
}

string Device::vendor(string deviceName)
{
	return "vendor";
}

string Device::version(string deviceName)
{
	return "version";
}

