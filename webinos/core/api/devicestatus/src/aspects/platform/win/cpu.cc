#include "../../cpu.h"
#include "../../../utils.h"

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
		
	return "Invalid property";
		
}

string CPU::model(string processorName)
{
    string res = Utils::WmiParam(L"DeviceID", "SELECT * FROM Win32_Processor");
	return res;
}

string CPU::currentLoad(string processorLoad)
{
	//return "currentLoad";	 
	string res = Utils::WmiParam(L"LoadPercentage", "SELECT * FROM Win32_Processor");
    return res;
	}
