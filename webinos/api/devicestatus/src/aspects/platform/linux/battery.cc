#include "../../battery.h"
#include "../../../utils.h"

#define BATTERY_BASE_DIR "/proc/acpi/battery/"

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

	string res = Utils::exec(string("ls -1 ") + BATTERY_BASE_DIR);

	int pos, lastpos = 0;

	while ( (pos = res.find('\n',lastpos)) != string::npos)
	{
		components.insert(components.end(), res.substr(lastpos, pos-lastpos).c_str());
		lastpos = pos+1;
	}

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
}

string Battery::batteryLevel(string batteryName)
{
	string line, tmp;
	int lastFullCapacity, remainingCapacity;

	if (batteryName[0] == '_')
		batteryName = getComponents()[2];

	string batteryInfoFile(BATTERY_BASE_DIR + batteryName + "/info");
	string batteryStateFile(BATTERY_BASE_DIR + batteryName + "/state");
	char* res = new char[7];

	ifstream info(batteryInfoFile.c_str());

	while(getline(info, line))
	{
		if (line.find("last full capacity") != string::npos)
		{
			stringstream linestream(line);
			linestream >> tmp >> tmp >> tmp >> lastFullCapacity >> tmp;
			break;
		}
	}

	ifstream state(batteryStateFile.c_str());

	while(getline(state, line))
	{
		if (line.find("remaining capacity") != string::npos)
		{
			stringstream linestream(line);
			linestream >> tmp >> tmp >> remainingCapacity >> tmp;
			break;
		}
	}

	sprintf(res, "%.2f", (float)remainingCapacity / lastFullCapacity * 100);

//	cout << res;
	return string(res);
}

string Battery::batteryBeingCharged(string batteryName)
{
	string line, tmp;
	string chargingState;

	if (batteryName[0] == '_')
		batteryName = getComponents()[2];

	string batteryStateFile(BATTERY_BASE_DIR + batteryName + "/state");

	ifstream state(batteryStateFile.c_str());

	while(getline(state, line))
	{
		if (line.find("charging state") != string::npos)
		{
			stringstream linestream(line);
			linestream >> tmp >> tmp >> chargingState;
			break;
		}
	}

	return chargingState == "charging" ? "true" : "false";
}
