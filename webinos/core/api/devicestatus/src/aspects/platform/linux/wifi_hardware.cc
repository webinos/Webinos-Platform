#include "../../wifi_hardware.h"
#include "../../../utils.h"
#include "string"
#include "iostream"
#include "fstream"
#include "sstream"

AspectsRegister WiFiHardware::aspectsRegister("WiFiHardware", getInstance());

WiFiHardware * WiFiHardware::wifiHardware = 0;

WiFiHardware * WiFiHardware::getInstance() {
	if ( wifiHardware == 0 )
		wifiHardware = new WiFiHardware();
	return wifiHardware;
}

vector<string> WiFiHardware::getComponents()
{
	vector<string> components;
        components.insert(components.end(), "_default");
        components.insert(components.end(), "_active");

        return components;
}



bool WiFiHardware::isSupported(string * property)
{
	return true;
}

string WiFiHardware::getPropertyValue(string * property, string *  component)
{
	if (*property == "status")
		return status(*component);
}

string WiFiHardware::status(string wifiHardwareName)
{
string line, res, result;
size_t pos;

 line = Utils::exec(string("iwconfig 2>&1")); //cat proc/load
 pos = line.find("ESSID");
 //cout<<line.size()<<endl;
 //cout<<pos<<endl;
 if(pos < line.size())
 { 
 //cout<<"check"<<endl;
 result = line.substr(pos);
 //cout<<result<<endl;
 res = result.substr(6,10); 
 return string(res);
 }
 else 
 {
 return "No ssid found";
 } 
}


            
