#include "../../cpu.h"
#include "../../../utils.h"
#include <cstdlib>
#include <string>
#include <iostream>
#include <fstream>
#include <sstream>

#define CPU_INFO_DIR "/proc/cpuinfo"

AspectsRegister CPU::aspectsRegister("CPU", getInstance());

CPU * CPU::cpu = 0;

CPU * CPU::getInstance() {
	if ( cpu == 0 )
		cpu = new CPU();
	return cpu;
}

vector<string> CPU::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");

	return components;
}

bool CPU::isSupported(string * property)
{
	return true;
}

string CPU::getPropertyValue(string * property, string * component)
{
	if (*property == "model")
		return model(*component);

	if (*property == "currentLoad")
		return currentLoad(*component);
}

string CPU::model(string model)
{
	return Utils::exec(string("echo -n `uname -p`"));
}

string CPU::currentLoad(string currentload)
{
	string line;
	size_t pos;

	line = Utils::exec(string("uptime")); //cat proc/loadavg
	pos = line.find("load average") + 14;

	return line.substr(pos);
}
