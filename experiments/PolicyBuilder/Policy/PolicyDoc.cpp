#include "PolicySystem.h"
#include "PolicyDoc.h"
#include "PolicySet.h"
#include "Policy.h"

CPolicyDoc::CPolicyDoc(std::string inp, bool isFile) : m_policySet(NULL), m_policy(NULL)
{
	xml_document doc;
	
	if (isFile)
	    doc.load_file(inp.c_str());
	else
        doc.load(inp.c_str());

	xpath_node root = doc.select_single_node("policy-set");
	if (!root.node().empty())
	{
		m_policySet = new CPolicySet(root.node());
	}
	else
	{
		root = doc.select_single_node("policy");
		if (!root.node().empty())
		{
			m_policy = new CPolicy(root.node());
		}
	}
}

CPolicyDoc::~CPolicyDoc(void)
{
	delete m_policySet;
	delete m_policy;
}

int CPolicyDoc::Evaluate(CQuery& query)
{
	int decision = inapplicable;
	bool targetMatched = false;

	if (m_policySet != NULL)
		decision = m_policySet->Evaluate(query,targetMatched);
	else if (m_policy != NULL)
		decision = m_policy->Evaluate(query,targetMatched);

	return decision;
}
