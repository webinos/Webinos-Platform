#pragma once

#include "AttributeValue.h"

class CLiteralAttributeValue : public CAttributeValue
{
private:
	std::string m_value;

public:
	CLiteralAttributeValue(std::string);
	virtual ~CLiteralAttributeValue(void);

	virtual std::string GetValue(CQuery&);
};
