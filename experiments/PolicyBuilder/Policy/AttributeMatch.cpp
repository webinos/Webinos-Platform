#include "PolicySystem.h"
#include "AttributeMatch.h"
#include "LiteralAttributeValue.h"
#include "RequestContext.h"
#include "Query.h"

CAttributeMatch::CAttributeMatch(xml_node& node, const std::string& context) : m_context(context)
{
	xml_attribute attr = node.attribute("attr");
	if (!attr.empty())
		m_attributeName = attr.value();

	attr = node.attribute("match");
	if (!attr.empty())
	{
		// If match attribute is specified, ignore any contained content.
		m_attributeValues.push_back(new CLiteralAttributeValue(attr.value()));
	}
	else
	{
		for (xml_node::iterator it = node.begin(); it != node.end(); it++)
		{
			CAttributeValue* attribute;

			switch (it->type())
			{
				case node_pcdata:
					attribute = new CLiteralAttributeValue(it->value());
					break;
				case node_element:
					if (it->name() == std::string("environment-attr"))
						attribute = new CAttributeValue(*it,CQuery::environment);
					else if (it->name() == std::string("resource-attr"))
						attribute = new CAttributeValue(*it,CQuery::resource);
					else if (it->name() == std::string("subject-attr"))
						attribute = new CAttributeValue(*it,CQuery::subject);
					else
						throw "unknown attribute type";
					break;
			}

			m_attributeValues.push_back(attribute);
		}
	}
}

CAttributeMatch::~CAttributeMatch(void)
{
}

std::string CAttributeMatch::GetPattern(CQuery& q)
{
	std::string val;

	for (ATTRIBUTE_VEC::iterator it = m_attributeValues.begin(); it != m_attributeValues.end(); it++)
	{
		CAttributeValue* attr = *it;
		val += attr->GetValue(q);
	}

	return val;
}

int CAttributeMatch::CheckMatch(std::string pattern, std::string val)
{
	// This should cover globs but we probably need a regex library...
	return pugi::impl::strcmpwild(pattern.c_str(),val.c_str()) == 0 ? determinedMatch : determinedNoMatch;
}

int CAttributeMatch::IsMatch(CQuery& query)
{
	std::string pattern = GetPattern(query);

	matchResult decision = undeterminedMatch;

	std::string contextVal;
	if (query.GetContext(m_context).GetValue(m_attributeName,contextVal))
		decision = (matchResult)CheckMatch(pattern,contextVal);

	return decision;
}
