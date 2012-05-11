#include "../../wired_network.h"
#include "../../../utils.h"
#include "string"
#include "iostream"
#include "fstream"
#include "sstream"

AspectsRegister WiredNetwork::aspectsRegister("WiredNetwork", getInstance());

WiredNetwork * WiredNetwork::wiredNetwork = 0;

WiredNetwork * WiredNetwork::getInstance() {
	if ( wiredNetwork == 0 )
		wiredNetwork = new WiredNetwork();
	return wiredNetwork;
}

vector<string> WiredNetwork::getComponents()
{

 vector<string> components;
        components.insert(components.end(), "_default");
        components.insert(components.end(), "_active");

        return components;
}



bool WiredNetwork::isSupported(string * property)
{
	return true;
}

string WiredNetwork::getPropertyValue(string * property, string * component)
{
	if (*property == "networkStatus")
                return networkStatus(*component);
	if (*property == "ipAddress")
                return ipAddress(*component);
	if (*property == "macAddress")
                return macAddress(*component);

}

string WiredNetwork::networkStatus(string wiredNetworkName)
{
/*string line, res, result;
size_t pos;

 line = Utils::exec(string("ifconfig -a")); //netstat
 pos = line.find("inet addr");
 result = line.substr (pos);
 res = result.substr (10,27);

        return string(res);*/

        return "networkStatus";
}

string WiredNetwork::ipAddress(string wiredNetworkName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("ifconfig -a"));
 pos = line.find("inet addr");
 result = line.substr (pos);
 res = result.substr (10,27);

        return string(res);

     //   return "ipAddress";
}

string WiredNetwork::macAddress(string wiredNetworkName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("ifconfig -a"));
 pos = line.find("HWaddr");
 result = line.substr (pos);
 res = result.substr (7,20);

        return string(res);       

// return "macAddress";
}

            
