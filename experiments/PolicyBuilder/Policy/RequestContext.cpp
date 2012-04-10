#include "PolicySystem.h"
#include "RequestContext.h"

CRequestContext::CRequestContext(void)
{
}

CRequestContext::~CRequestContext(void)
{
}

void CRequestContext::SetValue(std::string name, std::string val)
{
	m_attributes[name] = val;
}

bool CRequestContext::ParseURI( std::string inp,     
                                std::string& scheme,
                                std::string& authority,
                                std::string& host,
                                std::string& path)
//
// No regex support yet, so apologies for this:
//
{
    bool ok = true;
    
    size_t idx = inp.find_first_of("//:");
    if (idx != std::string::npos)
    {
        scheme = inp.substr(0,idx);
       
        inp = inp.substr(idx + 3);
        
        idx = inp.find_first_of('/');
        if (idx != std::string::npos)
        {
            authority = inp.substr(0,idx);
            path = inp.substr(idx + 1);
        }
        else
            authority = inp;

        idx = authority.find_first_of(':');
        if (idx != std::string::npos)
            host = authority.substr(0,idx);
        else
            host = authority;
    }
    else
        ok = false;
    
    return ok;
}

bool CRequestContext::GetValue(std::string name,std::string& val)
{
    std::string lookup;
    
    size_t suffixIdx = name.find_first_of('.');
    if (suffixIdx != std::string::npos)
        lookup = name.substr(0,suffixIdx);
    else
        lookup = name;

	ATTRIBUTE_MAP::iterator it = m_attributes.find(lookup);
	
	bool found = it != m_attributes.end();

	if (found)
	{
		val = it->second;
		
        if (suffixIdx != std::string::npos)
        {
            // This is a URI component lookup.
            std::string scheme;
            std::string authority;
            std::string host;
            std::string path;
            
            if (ParseURI(val,scheme,authority,host,path))
            {
                std::string suffix = name.substr(suffixIdx+1);
                
                if (suffix == "host")
                    val = host;
                else if (suffix == "authority")
                    val = authority;
                else if (suffix == "scheme")
                    val = scheme;
                else if (suffix == "path")
                    val = path;
                else if (suffix == "scheme-authority")
                    val = scheme + "://" + authority;
            }
        }
    }
	else
		val = "";

	return found;
}

