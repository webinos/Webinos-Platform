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
	components.insert(components.end(), "_active");

	return components;
}

bool CPU::isSupported(string * property)
{
	return true;
}

string CPU::getPropertyValue(string * property, string * component)
{
	if (*property == "currentLoad")
		return currentLoad(*component);

	if (*property == "model")
		return model(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string CPU::currentLoad(string currentload)
{
	return "currentLoad";
}

string CPU::model(string model)
{
	return "model";
}
