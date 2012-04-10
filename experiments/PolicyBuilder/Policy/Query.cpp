#include "PolicySystem.h"
#include "Query.h"
#include "PolicyDoc.h"
#include "RequestContext.h"

const std::string CQuery::environment = "environment";
const std::string CQuery::subject = "subject";
const std::string CQuery::resource = "resource";
const std::string CQuery::literalContext = "";

void LoadContext(CRequestContext* context,xpath_node_set query)
{
    for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
    {
        xml_attribute attrName = it->node().attribute("attr");
        xml_attribute attrVal = it->node().attribute("match");
        
        context->SetValue(attrName.value(),attrVal.value());
    }
}

CQuery::CQuery(void)
{
    CommonConstruct();
}

CQuery::CQuery(std::string requestXML)
{
    CommonConstruct();

	xml_document doc;
    doc.load(requestXML.c_str());

    xpath_node_set query = doc.select_nodes("request/subject-match");
    LoadContext(m_contexts[subject],query);

    query = doc.select_nodes("request/resource-match");
    LoadContext(m_contexts[resource],query);

    query = doc.select_nodes("request/environment-match");
    LoadContext(m_contexts[environment],query);
}

CQuery::~CQuery(void)
{
}

void CQuery::CommonConstruct()
{
	m_contexts[environment] = new CRequestContext();
	m_contexts[subject] = new CRequestContext();
	m_contexts[resource] = new CRequestContext();
}

CRequestContext& CQuery::GetContext(const std::string& name)
{
	return *m_contexts[name];
}

CRequestContext& CQuery::GetEnvironmentCtx() 
{ 
	return GetContext(environment);
}

CRequestContext& CQuery::GetSubjectCtx() 
{ 
	return GetContext(subject);
}

CRequestContext& CQuery::GetResourceCtx() 
{ 
	return GetContext(resource);
}

decisionResult CQuery::GetDecision(CPolicyDoc& policyDoc)
{
	int decision = policyDoc.Evaluate(*this);
	return (decisionResult)decision;
}
