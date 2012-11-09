#include "../../display.h"
#include "../../../utils.h"
#include <cstdlib>

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

string Display::resolutionHeight(string displayheight)
{
     string res = Utils::WmiParam(L"HorizontalResolution", "SELECT * FROM Win32_DisplayControllerConfiguration");
	 return res;
     //return "resolutionHeight";

}
	
string Display::pixelAspectRatio(string displayratio)	
{
     string res = Utils::WmiParam(L"BitsPerPixel", "SELECT * FROM Win32_DisplayControllerConfiguration");
	 return res;
	 //return "pixelAspectRatio";	
}
	
string Display::dpiY(string displayY)	
{
     string res = Utils::WmiParam(L"LogPixels", "SELECT * FROM Win32_DisplayConfiguration"); //PelsHeight
	 return res;
	 //return "dpiY";
}

string Display::resolutionWidth(string displaywidth)
{
     string res = Utils::WmiParam(L"VerticalResolution", "SELECT * FROM Win32_DisplayControllerConfiguration");
	 return res; 
	  //return "resolutionWidth";
}

string Display::dpiX(string displayX)	
{
     string res = Utils::WmiParam(L"LogPixels", "SELECT * FROM Win32_DisplayConfiguration");  //PelsWidth
	 return res;
     // return "dpiX";	
}

string Display::colorDepth(string displaydepth)
{
     string res = Utils::WmiParam(L"ColorPlanes", "SELECT * FROM Win32_DisplayControllerConfiguration");
	 return res;
       //return "colorDepth";	
}

