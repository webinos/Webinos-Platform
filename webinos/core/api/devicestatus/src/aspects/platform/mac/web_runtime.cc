#include "../../web_runtime.h"
#include "../../../utils.h"

AspectsRegister WebRuntime::aspectsRegister("WebRuntime", getInstance());

WebRuntime * WebRuntime::webRuntime = 0;

WebRuntime * WebRuntime::getInstance() {
	if ( webRuntime == 0 )
		webRuntime = new WebRuntime();
	return webRuntime;
}

vector<string> WebRuntime::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool WebRuntime::isSupported(string * property)
{
	return true;
}

string WebRuntime::getPropertyValue(string * property, string * component)
{
	if (*property == "version")
		return version(*component);

	if (*property == "name")
		return name(*component);

	if (*property == "vendor")
		return vendor(*component);

	if (*property == "webinosVersion")
		return webinosVersion(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string WebRuntime::version(string webRuntimeComponent)
{
	return "version";
}

string WebRuntime::name(string webRuntimeComponent)
{
	return "name";
}

string WebRuntime::vendor(string webRuntimeComponent)
{
	return "vendor";
}

string WebRuntime::webinosVersion(string webRuntimeComponent)
{
	return "webinosVersion";
}
