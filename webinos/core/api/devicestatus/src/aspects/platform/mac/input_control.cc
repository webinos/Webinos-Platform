#include "../../input_control.h"
#include "../../../utils.h"

AspectsRegister InputControl::aspectsRegister("InputControl", getInstance());

InputControl * InputControl::inputControl = 0;

InputControl * InputControl::getInstance() {
	if ( inputControl == 0 )
		inputControl = new InputControl();
	return inputControl;
}

vector<string> InputControl::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool InputControl::isSupported(string * property)
{
	return true;
}

string InputControl::getPropertyValue(string * property, string * component)
{
	if (*property == "touchscreen")
		return touchscreen(*component);

	if (*property == "touchpad")
		return touchpad(*component);

	if (*property == "mouse")
		return mouse(*component);

	if (*property == "scrollwheel")
		return scrollwheel(*component);

	if (*property == "keyboard")
		return keyboard(*component);

	if (*property == "cursorkeyboard")
		return cursorkeyboard(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string InputControl::touchscreen(string inputControlComponent)
{
	return "touchscreen";
}

string InputControl::touchpad(string inputControlComponent)
{
	return "touchpad";
}

string InputControl::mouse(string inputControlComponent)
{
	return "mouse";
}

string InputControl::scrollwheel(string inputControlComponent)
{
	return "scrollwheel";
}

string InputControl::keyboard(string inputControlComponent)
{
	return "keyboard";
}

string InputControl::cursorkeyboard(string inputControlComponent)
{
	return "cursorkeyboard";
}
