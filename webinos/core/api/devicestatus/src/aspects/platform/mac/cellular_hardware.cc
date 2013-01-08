#include "../../cellular_hardware.h"
#include "../../../utils.h"

AspectsRegister CellularHardware::aspectsRegister("CellularHardware", getInstance());

CellularHardware * CellularHardware::cellularHardware = 0;

CellularHardware * CellularHardware::getInstance() {
	if ( cellularHardware == 0 )
		cellularHardware = new CellularHardware();
	return cellularHardware;
}

vector<string> CellularHardware::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool CellularHardware::isSupported(string * property)
{
	return true;
}

string CellularHardware::getPropertyValue(string * property, string * component)
{
	if (*property == "status")
		return status(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string CellularHardware::status(string cellularHardwareComponent)
{
	return "status";
}
