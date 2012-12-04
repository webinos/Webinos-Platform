#include "../../display.h"
#include "../../../utils.h"
#include <cstdlib>
#include <string>
#include <iostream>
#include <fstream>
#include <sstream>

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

}

string Display::pixelAspectRatio(string displayratio)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xdpyinfo"));
	pos = line.find("dimensions")+15;
	pos_endl = line.find('\n', pos);

	return line.substr (pos, pos_endl - pos);
}

string Display::dpiX(string displayX)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xdpyinfo"));
	pos = line.find("resolution") + 15;
	pos_endl = line.find("x", pos);

	return line.substr (pos, pos_endl - pos);
}

string Display::dpiY(string displayY)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xdpyinfo"));
	pos = line.find("resolution");
	pos = line.find("x", pos) + 1;
	pos_endl = line.find(' ', pos);

	return line.substr (pos, pos_endl - pos);
}

string Display::resolutionHeight(string displayheight)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xwininfo -root"));
	pos = line.find("Height") + 8;
	pos_endl = line.find('\n', pos);

	return line.substr (pos, pos_endl - pos);
}

string Display::resolutionWidth(string displaywidth)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xwininfo -root"));
	pos = line.find("Width") + 7;
	pos_endl = line.find('\n', pos);

	return line.substr (pos, pos_endl - pos);
}

string Display::colorDepth(string displaydepth)
{
	string line;
	size_t pos, pos_endl;

	line = Utils::exec(string("xwininfo -root"));
	pos = line.find("Depth") + 7;
	pos_endl = line.find('\n', pos);

	return line.substr (pos, pos_endl - pos);
}



