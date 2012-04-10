#pragma once

#include <map>

class CRequestContext
{
private:
	typedef std::map<std::string,std::string> ATTRIBUTE_MAP;
	ATTRIBUTE_MAP m_attributes;

    bool ParseURI(  std::string inp,     
                    std::string& scheme,
                    std::string& authority,
                    std::string& host,
                    std::string& path);
public:
	CRequestContext(void);
	virtual ~CRequestContext(void);

	virtual bool GetValue(std::string name,std::string& val);
	virtual void SetValue(std::string name,std::string val);
};
