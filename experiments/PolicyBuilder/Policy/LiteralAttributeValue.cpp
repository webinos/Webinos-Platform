#include "PolicySystem.h"
#include "LiteralAttributeValue.h"
#include "Query.h"

CLiteralAttributeValue::CLiteralAttributeValue(std::string val) : CAttributeValue(CQuery::literalContext)
{
	// Trim space and new-lines.
	m_value = val.erase(val.find_last_not_of(" \x0a\x0d") + 1);
}

CLiteralAttributeValue::~CLiteralAttributeValue(void)
{
}

std::string CLiteralAttributeValue::GetValue(CQuery&)
{
	return m_value;
}
