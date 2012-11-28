#include "../../parental_rating.h"
#include "../../../utils.h"

AspectsRegister ParentalRating::aspectsRegister("ParentalRating", getInstance());

ParentalRating * ParentalRating::parentalRating = 0;

ParentalRating * ParentalRating::getInstance() {
	if ( parentalRating == 0 )
		parentalRating = new ParentalRating();
	return parentalRating;
}

vector<string> ParentalRating::getComponents()
{
	vector<string> components;
	components.insert(components.end(), "_default");
	components.insert(components.end(), "_active");

	return components;
}

bool ParentalRating::isSupported(string * property)
{
	return true;
}

string ParentalRating::getPropertyValue(string * property, string * component)
{
	if (*property == "name")
		return name(*component);

	if (*property == "scheme")
		return scheme(*component);

	if (*property == "region")
		return region(*component);

	// TODO: instead trigger the error callback with DOMError of type InvalidAccessError (or abort if no error callback defined)
	return "Invalid access error";
}

string ParentalRating::name(string parentalRatingComponent)
{
	return "name";
}

string ParentalRating::scheme(string parentalRatingComponent)
{
	return "scheme";
}

string ParentalRating::region(string parentalRatingComponent)
{
	return "region";
}
