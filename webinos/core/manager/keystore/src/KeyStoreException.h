#ifndef KEYSTOREEXCEPTION_H
#define KEYSTOREEXCEPTION_H

#include <string>


class KeyStoreException
{
public:
    KeyStoreException(const char * msg)
    : theMsg(msg)
    {}
    
    const char * what() const throw() { return theMsg.c_str(); }
private:
    std::string theMsg;
};

#endif
