#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

#define BATTERY_INFO_FILE "/proc/acpi/battery/BAT0/info"
#define BATTERY_STATE_FILE "/proc/acpi/battery/BAT0/state"

string batteryLevel();
