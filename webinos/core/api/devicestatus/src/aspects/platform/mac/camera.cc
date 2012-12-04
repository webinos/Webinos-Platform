#include "../../camera.h"
#include "../../../utils.h"

AspectsRegister Camera::aspectsRegister("Camera", getInstance());

Camera * Camera::camera = 0;

Camera * Camera::getInstance() {
	if ( camera == 0 )
		camera = new Camera();
	return camera;
}

vector<string> Camera::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool Camera::isSupported(string * property)
{
	return true;
}

string Camera::getPropertyValue(string * property, string * component)
{
	if (*property == "model")
		return model(*component);

	if (*property == "vendor")
		return vendor(*component);

	if (*property == "status")
		return status(*component);

	if (*property == "resolutionHeight")
		return resolutionHeight(*component);

	if (*property == "resolutionWidth")
		return resolutionWidth(*component);

	if (*property == "minZoom")
		return minZoom(*component);

	if (*property == "maxZoom")
		return maxZoom(*component);

	if (*property == "currentZoom")
		return currentZoom(*component);

	if (*property == "hasFlash")
		return hasFlash(*component);

	if (*property == "flashOn")
		return flashOn(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string Camera::model(string cameraComponent)
{
	return "model";
}

string Camera::vendor(string cameraComponent)
{
	return "vendor";
}

string Camera::status(string cameraComponent)
{
	return "status";
}

string Camera::resolutionHeight(string cameraComponent)
{
	return "resolutionHeight";
}

string Camera::resolutionWidth(string cameraComponent)
{
	return "resolutionWidth";
}

string Camera::minZoom(string cameraComponent)
{
	return "minZoom";
}

string Camera::maxZoom(string cameraComponent)
{
	return "maxZoom";
}

string Camera::currentZoom(string cameraComponent)
{
	return "currentZoom";
}

string Camera::hasFlash(string cameraComponent)
{
	return "hasFlash";
}

string Camera::flashOn(string cameraComponent)
{
	return "flashOn";
}
