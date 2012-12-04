#include "../../operating_system.h"
#include "../../../utils.h"

AspectsRegister OperatingSystem::aspectsRegister("OperatingSystem", getInstance());

OperatingSystem * OperatingSystem::operatingSystem = 0;

OperatingSystem * OperatingSystem::getInstance() {
	if ( operatingSystem == 0 )
		operatingSystem = new OperatingSystem();
	return operatingSystem;
}

vector<string> OperatingSystem::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool OperatingSystem::isSupported(string * property)
{
	return true;
}

string OperatingSystem::getPropertyValue(string * property, string * component)
{
	if (*property == "language")
		return language(*component);

	if (*property == "version")
		return version(*component);

	if (*property == "name")
		return name(*component);

	if (*property == "vendor")
		return vendor(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string OperatingSystem::language(string osComponent)
{
	return "language";
}

string OperatingSystem::version(string osComponent)
{
	return "version";
}

string OperatingSystem::name(string osComponent)
{
	return "name";
}

string OperatingSystem::vendor(string osComponent)
{
	return "vendor";
}
