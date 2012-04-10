#pragma once

#include <vector>
#include "DecisionNode.h"

class CAttributeValue;

class CAttributeMatch : public CDecisionNode
{
private:
	const std::string& m_context;
	std::string m_attributeName;

	typedef std::vector<CAttributeValue*> ATTRIBUTE_VEC;
	ATTRIBUTE_VEC m_attributeValues;

	int CheckMatch(std::string pattern, std::string val);
	std::string GetPattern(CQuery& q);

public:
	CAttributeMatch(xml_node& node, const std::string& ctx);
	virtual ~CAttributeMatch(void);

	virtual int IsMatch(CQuery& query);
};
