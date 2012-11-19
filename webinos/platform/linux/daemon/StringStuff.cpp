#if defined(WIN32)
#include "stdafx.h"
#endif
#include "StringStuff.h"

namespace webinos
{
  // trim trailing
  std::string& rtrim(std::string& str, const std::string& trim)
  {
    size_t endpos = str.find_last_not_of(trim);
    if (std::string::npos != endpos)
    {
        str = str.substr( 0, endpos+1 );
    }

    return str;
  }

  // trim leading
  std::string& ltrim(std::string& str, const std::string& trim)
  {
    size_t startpos = str.find_first_not_of(trim);
    if (std::string::npos != startpos )
    {
        str = str.substr( startpos );
    }

    return str;
  }

  std::string trim(std::string& str, const std::string& trim)
  {
    return ltrim(rtrim(str,trim),trim);
  }

  std::vector<std::string> split(const char *str, char c)
  {
      std::vector<std::string> result;

      while (1)
      {
          const char *begin = str;

          while(*str != c && *str)
            str++;

          result.push_back(std::string(begin, str));

          if (0 == *str++)
            break;
      }

      return result;
  }

  std::string replace(std::string& str, const std::string& find, const std::string& replace)
  {
    size_t index = 0;
    while (true) 
    {
      /* Locate the substring to replace. */
      index = str.find(find, index);
      if (index == std::string::npos) 
        break;

      /* Make the replacement. */
      str.replace(index, find.length(), replace);

      /* Advance index forward one spot so the next iteration doesn't pick it up as well. */
      index += replace.length();
    }

    return str;
  }
}
