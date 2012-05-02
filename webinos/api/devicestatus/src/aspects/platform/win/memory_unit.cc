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
}

string MemoryUnit::size(string size)
{
    //string res1 = Utils::WmiParam(L"Name", "SELECT * FROM Win32_MemoryDevice");  //PhysicalMemory- Capacity, MemoryType, Name
    string res2 = Utils::WmiParam(L"BlockSize", "SELECT * FROM Win32_MemoryDevice");
	//string res3 = Utils::WmiParam(L"Availability", "SELECT * FROM Win32_MemoryDevice");
	//string res = res1 + res2 + res3;
	return res2;
}

string MemoryUnit::removable(string removable)
{
    string res = Utils::WmiParam(L"Removable", "SELECT * FROM Win32_PhysicalMemory");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	return res;
}

string MemoryUnit::availableSize(string availableSize)
{
    string res = Utils::WmiParam(L"ConnectionState", "SELECT * FROM Win32_NetworkConnection");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	return res;
}

string MemoryUnit::volatil(string volatil)
{    
    string res = Utils::WmiParam(L"ConnectionState", "SELECT * FROM Win32_NetworkConnection");
	//string res = Utils::WmiParam(L"NetConnectionStatus", "SELECT * FROM Win32_NetworkAdapter");
	return res;
}