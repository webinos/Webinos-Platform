#include "../../input_device.h"
#include "../../../utils.h"

AspectsRegister InputDevice::aspectsRegister("InputDevice", getInstance());

InputDevice * InputDevice::inputDevice = 0;

InputDevice * InputDevice::getInstance() {
	if ( inputDevice == 0 )
		inputDevice = new InputDevice();
	return inputDevice;
}

vector<string> InputDevice::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool InputDevice::isSupported(string * property)
{
	return true;
}

string InputDevice::getPropertyValue(string * property, string * component)
{
	if (*property == "type")
		return type(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string InputDevice::type(string inputDeviceComponent)
{
	return "type";
}
