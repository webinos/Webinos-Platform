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
}

string OperatingSystem::language(string oslanguage)
{
    string res = Utils::WmiParam(L"Locale", "SELECT * FROM Win32_OperatingSystem");
	return res;
	//return "language";
}

string OperatingSystem::version(string osversion)
{
    string res = Utils::WmiParam(L"Version", "SELECT * FROM Win32_OperatingSystem");
	return res;
	//return "version";
}

string OperatingSystem::name(string osname)
{
    string res = Utils::WmiParam(L"Name", "SELECT * FROM Win32_OperatingSystem");
	return res;
	//return "name";
}

string OperatingSystem::vendor(string osVendor)
{
    string res = Utils::WmiParam(L"Manufacturer", "SELECT * FROM Win32_OperatingSystem");
	return res;
	//return "vendor";
}
