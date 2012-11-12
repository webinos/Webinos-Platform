#include "../../cpu.h"
#include "../../../utils.h"
#include <cstdlib>

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

/*	string res = Utils::exec(string("cat ") + CPU_INFO_DIR + " | grep 'processor' | cut -c 13-");

	int pos, lastpos = 0;

	while ( (pos = res.find('\n',lastpos)) != string::npos)
	{
		components.insert(components.end(), string("processor") + res.substr(lastpos, pos-lastpos).c_str());
		lastpos = pos+1;
	}*/

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
/*	vector<string> models;
	
	string res = Utils::exec(string("cat ") + CPU_INFO_DIR + string(" | grep 'model name' | cut -c 14-"));

	int pos, lastpos = 0;

	while ( (pos = res.find('\n',lastpos)) != string::npos)
	{
		models.insert(models.end(), string("processor") + res.substr(lastpos, pos-lastpos).c_str());
		lastpos = pos+1;
	}

	if (model[0] == '_')
		model = getComponents()[2];

	return models[atoi(model.substr(9).c_str())];*/

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
