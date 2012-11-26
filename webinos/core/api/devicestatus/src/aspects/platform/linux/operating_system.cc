#include "../../operating_system.h"
#include "../../../utils.h"
#include <string>
#include <iostream>
#include <fstream>
#include <sstream>

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
	string line;
	size_t pos, pos_endl;
	
	line = Utils::exec(string("locale -ck LC_IDENTIFICATION"));
	pos = line.find("language") + 10;
	pos_endl = line.find('\n', pos);

	return line.substr (pos, pos_endl - pos - 1);
}

string OperatingSystem::version(string osversion)
{
	return Utils::exec(string("echo -n `uname -sr`"));
}

string OperatingSystem::name(string osname)
{
	return Utils::exec(string("echo -n `cat /etc/*version /etc/*release 2>/dev/null`"));
}

string OperatingSystem::vendor(string osvendor)
{
	return Utils::exec(string("echo -n `uname -o`"));
}
