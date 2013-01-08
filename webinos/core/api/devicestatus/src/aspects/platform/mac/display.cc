#include "../../display.h"
#include "../../../utils.h"

AspectsRegister Display::aspectsRegister("Display", getInstance());

Display * Display::display = 0;

Display * Display::getInstance() {
	if ( display == 0 )
		display = new Display();
	return display;
}

vector<string> Display::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");

	return components;
}

bool Display::isSupported(string * property)
{
	return true;
}

string Display::getPropertyValue(string * property, string * component)
{
	if (*property == "resolutionHeight")
		return resolutionHeight(*component);

	if (*property == "pixelAspectRatio")
		return pixelAspectRatio(*component);

	if (*property == "dpiY")
		return dpiY(*component);

	if (*property == "resolutionWidth")
		return resolutionWidth(*component);

        if (*property == "dpiX")
                return dpiX(*component);

        if (*property == "colorDepth")
                return colorDepth(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string Display::pixelAspectRatio(string displayratio)
{
	return "pixelAspectRatio";
}

string Display::dpiX(string displayX)
{
	return "dpiX";
}

string Display::dpiY(string displayY)
{
	return "dpiY";
}

string Display::resolutionHeight(string displayheight)
{
	return "resolutionHeight";
}

string Display::resolutionWidth(string displaywidth)
{
	return "resolutionWidth";
}

string Display::colorDepth(string displaydepth)
{
	return "colorDepth"; 
}



