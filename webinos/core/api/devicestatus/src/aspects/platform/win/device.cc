#include "../../device.h"
#include "../../../utils.h"

AspectsRegister Device::aspectsRegister("Device", getInstance());

Device * Device::device = 0;

Device * Device::getInstance() {
	if ( device == 0 )
		device = new Device();
	return device;
}

vector<string> Device::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");

	return components;
}

bool Device::isSupported(string * property)
{
	return true;
}

string Device::getPropertyValue(string * property, string * component)
{
	if (*property == "imei")
		return imei(*component);

	if (*property == "model")
		return model(*component);

	if (*property == "version")
		return version(*component);

	if (*property == "vendor")
		return vendor(*component);

}

string Device::imei(string deviceimei)
{
    string res1 = Utils::WmiParam(L"SerialNumber", "SELECT * FROM CIM_PhysicalElement");
	string res2 = "(No IMEI in PC so showing SerialNumber)";
	string res = res1 + res2;
	return res;
	//return "Specific to Windows PC: No IMEI number";
}

string Device::model(string devicemodel)
{
    string res = Utils::WmiParam(L"Model", "SELECT * FROM CIM_PhysicalElement");
	return res;
	//return "model";
}

string Device::version(string deviceversion)
{
	string res = Utils::WmiParam(L"Version", "SELECT * FROM CIM_PhysicalElement");
	return res;
	//return "version";
}

string Device::vendor(string devicevendor)
{
    string res = Utils::WmiParam(L"Manufacturer", "SELECT * FROM CIM_PhysicalElement");
	return res;
	//return "vendor";
}