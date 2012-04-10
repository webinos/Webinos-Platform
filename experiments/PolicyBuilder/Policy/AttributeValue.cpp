#include "PolicySystem.h"
#include "AttributeValue.h"
#include "Query.h"
#include "RequestContext.h"

CAttributeValue::CAttributeValue(const std::string& ctx) : m_context(ctx)
{
}

CAttributeValue::CAttributeValue(xml_node& node, const std::string& ctx) : m_context(ctx)
{
	xml_attribute attr = node.attribute("attr");
	if (!attr.empty())
		m_name = attr.value();
}

CAttributeValue::~CAttributeValue(void)
{
}

std::string CAttributeValue::GetValue(CQuery& q)
{
	std::string val;
	q.GetContext(m_context).GetValue(GetName(),val);
	return val;
}
