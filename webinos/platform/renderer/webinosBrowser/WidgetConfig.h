#pragma once

#include "KeyValueProperties.h"

namespace webinos
{

class WidgetConfig : private KeyValueProperties
{
public:
  WidgetConfig(void);
  ~WidgetConfig(void);

  bool LoadFromURL(std::string url);
  std::string GetWidgetPath(void) { return m_widgetPath; }
  std::string GetUrlPath(void) { return m_urlPath; }
  std::string GetInstallId(void) { return m_installId; }

  bool isLoaded(void) { return m_loaded; }
  int width(void) const;
  int height(void) const;
  std::string startFile(void) const;
  std::string author(void) const;
  std::string description(void) const;
  std::string name(void) const;
  std::string shortName(void) const;
  std::string version(void) const;
  std::string id(void) const;
  std::string authorEmail(void) const;
  std::string authorHref(void) const;

private:
  bool m_loaded;
  std::string m_installId;
  std::string m_widgetPath;
  std::string m_urlPath;
};

}
