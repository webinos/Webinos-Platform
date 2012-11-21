#include "../../cellular_network.h"
#include "../../../utils.h"

AspectsRegister CellularNetwork::aspectsRegister("CellularNetwork", getInstance());

CellularNetwork * CellularNetwork::cellularNetwork = 0;

CellularNetwork * CellularNetwork::getInstance() {
	if ( cellularNetwork == 0 )
		cellularNetwork = new CellularNetwork();
	return cellularNetwork;
}

vector<string> CellularNetwork::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool CellularNetwork::isSupported(string * property)
{
	return true;
}

string CellularNetwork::getPropertyValue(string * property, string * component)
{
	if (*property == "isInRoaming")
		return isInRoaming(*component);

	if (*property == "mcc")
		return mcc(*component);

	if (*property == "mnc")
		return mnc(*component);

	if (*property == "signalStrength")
		return signalStrength(*component);

	if (*property == "operatorName")
		return operatorName(*component);

	if (*property == "ipAddress")
		return ipAddress(*component);

	if (*property == "macAddress")
		return macAddress(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string CellularNetwork::isInRoaming(string cellularNetworkComponent)
{
	return "isInRoaming";
}

string CellularNetwork::mcc(string cellularNetworkComponent)
{
	return "mcc";
}

string CellularNetwork::mnc(string cellularNetworkComponent)
{
	return "mnc";
}

string CellularNetwork::signalStrength(string cellularNetworkComponent)
{
	return "signalStrength";
}

string CellularNetwork::operatorName(string cellularNetworkComponent)
{
	return "operatorName";
}

string CellularNetwork::ipAddress(string cellularNetworkComponent)
{
	return "ipAddress";
}

string CellularNetwork::macAddress(string cellularNetworkComponent)
{
	return "macAddress";
}
