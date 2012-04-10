#include "battery.h"

string batteryLevel()
{
	string line, tmp;
	int last_full_capacity, remaining_capacity;
	char* res = new char[7];

	ifstream info(BATTERY_INFO_FILE);

	while(getline(info, line))
	{
		if (line.find("last full capacity") != string::npos)
		{
			stringstream linestream(line);
			linestream >> tmp >> tmp >> tmp >> last_full_capacity >> tmp;
			break;
		}
	}
	
	ifstream state(BATTERY_STATE_FILE);

	while(getline(state, line))
	{
		if (line.find("remaining capacity") != string::npos)
		{
			stringstream linestream(line);
			linestream >> tmp >> tmp >> remaining_capacity >> tmp;
			break;
		}
	}
	
	sprintf(res, "%.2f", (float)remaining_capacity/last_full_capacity*100);

	return string(res);
}
