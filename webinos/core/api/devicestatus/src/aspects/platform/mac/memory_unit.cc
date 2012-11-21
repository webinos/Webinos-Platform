#include "../../memory_unit.h"
#include "../../../utils.h"

AspectsRegister MemoryUnit::aspectsRegister("MemoryUnit", getInstance());

MemoryUnit * MemoryUnit::memoryUnit = 0;

MemoryUnit * MemoryUnit::getInstance() {
	if ( memoryUnit == 0 )
		memoryUnit = new MemoryUnit();
	return memoryUnit;
}

vector<string> MemoryUnit::getComponents()
{

 vector<string> components;
        components.insert(components.end(), "_default");
        components.insert(components.end(), "_active");

        return components;
}

bool MemoryUnit::isSupported(string * property)
{
	return true;
}

string MemoryUnit::getPropertyValue(string * property, string * component)
{
	if (*property == "size")
		return size(*component);

	if (*property == "removable")
		return removable(*component);

	if (*property == "availableSize")
		return availableSize(*component);

	if (*property == "volatile")
		return volatil(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string MemoryUnit::size(string memoryUnitComponent)
{
	return "size";
} 

string MemoryUnit::removable(string memoryUnitComponent)
{
	return "removable";
}

string MemoryUnit::availableSize(string memoryUnitComponent)
{
	return "availableSize";
}

string MemoryUnit::volatil(string memoryUnitComponent)
{
	return "vendor";
}
