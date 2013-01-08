#include "../../memory_unit.h"
#include "../../../utils.h"
#include "string"
#include "iostream"
#include "fstream"
#include "sstream"
#include "stdio.h"
#include "stdlib.h"
//#define OS_BASE_DIR "/proc/sys/kernel/"

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

string MemoryUnit::size(string memoUnit)
{

string res;
size_t pos;

 res = Utils::exec(string("df -h | awk '//{print $1 \":\"  $2}'"));
  
return string(res);
} 

string MemoryUnit::removable(string memoUnit)
{

        return "removable not Implemented";
}

            
string MemoryUnit::availableSize(string memoUnit)
{
string res;
size_t pos;

res = Utils::exec(string("df -h | awk '//{print $1 \":\"  $4}'"));

return string(res);

}

string MemoryUnit::volatil(string memoUnit)
{
string line, res, result;
size_t pos;

    ifstream finfo("/proc/version"); //uname -r // ("/proc/version")
    while(getline(finfo,line)) {
        stringstream str(line);

          if ( getline(str, line)){
          pos = line.find("Ubuntu");    // position of "live" in str
          result = line.substr (pos);
          res = result.substr (0,27);
    break;
        }
    }
return string(res);
}
