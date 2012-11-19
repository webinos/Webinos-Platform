
#include "webinosBrowser/webinosBrowser.h"
#include <algorithm>
#include <string>
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_response.h"
#include "include/cef_request.h"
#include "include/cef_scheme.h"
#include "webinosBrowser/util.h"

#if defined(OS_WIN)
#include "webinosBrowser/resource.h"
#endif

#include "webinosBrowser/WidgetSchemeHandler.h"
#include "webinosBrowser/WidgetConfig.h"

namespace webinos
{

WidgetSchemeHandler::WidgetSchemeHandler(void) : m_resourceStream(NULL), m_statusCode(0)
{
}

WidgetSchemeHandler::~WidgetSchemeHandler(void)
{
  m_resourceStream = NULL;
}

bool WidgetSchemeHandler::ProcessRequest(CefRefPtr<CefRequest> request, CefRefPtr<CefCallback> callback)
{
  REQUIRE_IO_THREAD();

  AutoLock lock_scope(this);

  std::string requestURL = request->GetURL();

  WidgetConfig cfg;
  if (cfg.LoadFromURL(requestURL)) 
  {
    std::string urlPath = cfg.GetUrlPath();
    if (urlPath.length() == 0)
      urlPath = cfg.startFile();

    if (urlPath.length() > 0)
    {
      m_resourcePath = cfg.GetWidgetPath() + "/wgt/" + urlPath;
    }
  }

  if (m_resourcePath.length() == 0)
  {
    m_resourcePath = requestURL;
  }

  // Indicate the headers are available.
  callback->Continue();

  return true;
}

void WidgetSchemeHandler::GetResponseHeaders(CefRefPtr<CefResponse> response, int64& response_length, CefString& redirectUrl)  
{
  REQUIRE_IO_THREAD();

  size_t extStart = m_resourcePath.find_last_of('.');
  if (extStart != std::string::npos)
  {
    std::string ext = m_resourcePath.substr(extStart+1);

    // TODO - 3rd party library for this?
    if (ext == "html" || ext == "htm")
      response->SetMimeType("text/html");
    else if (ext == "png" || ext == "jpg" || ext == "ico")
      response->SetMimeType("image/" + ext);
    else if (ext == "css")
      response->SetMimeType("text/css");
    else if (ext == "js")
      response->SetMimeType("text/javascript");
    else
      response->SetMimeType("text/plain");
  }
  else
    response->SetMimeType("text/plain");

  response_length = -1;

  if (m_resourcePath.length() > 0 && (m_resourceStream = CefStreamReader::CreateForFile(m_resourcePath)) != NULL)
  {
    m_statusCode = 200;
  }
  else
  {
    m_statusCode = 404;
    redirectUrl = "webinos://resourceNotFound";
    //m_resourceStream = GetBinaryResourceReader(IDS_WEBINOS_404_PAGE);
    //response->SetMimeType("text/html");
  }

  response->SetStatus(m_statusCode);
}

void WidgetSchemeHandler::Cancel() 
{
  REQUIRE_IO_THREAD();
}

bool WidgetSchemeHandler::ReadResponse(void* data_out, int bytes_to_read, int& bytes_read, CefRefPtr<CefCallback> callback)  
{
	REQUIRE_IO_THREAD();

	bool has_data = false;
	bytes_read = 0;

	AutoLock lock_scope(this);

  if (m_resourceStream != NULL)
  {
    if (m_resourceStream->Eof())
    {
      m_resourceStream = NULL;
    }
    else
    {
      bytes_read = m_resourceStream->Read((char*)data_out,1,bytes_to_read);
      has_data = true;
    }
  }

	return has_data;
}

}
