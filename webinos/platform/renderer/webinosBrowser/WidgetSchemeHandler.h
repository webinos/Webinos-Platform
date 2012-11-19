#pragma once

#include "include/cef_scheme.h"

namespace webinos 
{

class WidgetSchemeHandler : public CefResourceHandler // todo: use CefStreamResourceHandler?
{
public:
	WidgetSchemeHandler(void);
	~WidgetSchemeHandler(void);

	virtual bool ProcessRequest(CefRefPtr<CefRequest> request, CefRefPtr<CefCallback> callback) OVERRIDE;
	virtual void GetResponseHeaders(CefRefPtr<CefResponse> response, int64& response_length, CefString& redirectUrl) OVERRIDE;
	virtual bool ReadResponse(void* data_out, int bytes_to_read, int& bytes_read, CefRefPtr<CefCallback> callback) OVERRIDE;
	virtual void Cancel() OVERRIDE;

private:
  IMPLEMENT_REFCOUNTING(WidgetSchemeHandler);
  IMPLEMENT_LOCKING(WidgetSchemeHandler);

  std::string m_widgetStorePath;
  std::string m_resourcePath;
  CefRefPtr<CefStreamReader> m_resourceStream;
  int m_statusCode;
};

// Implementation of the factory for creating widget handlers.
class WidgetSchemeHandlerFactory : public CefSchemeHandlerFactory 
{
public:
  // Return a new scheme handler instance to handle the request.
  virtual CefRefPtr<CefResourceHandler> Create(CefRefPtr<CefBrowser> browser,
                                             CefRefPtr<CefFrame> frame,
                                             const CefString& scheme_name,
                                             CefRefPtr<CefRequest> request)
                                             OVERRIDE 
  {
    REQUIRE_IO_THREAD();
    return new WidgetSchemeHandler();
  }

  IMPLEMENT_REFCOUNTING(WidgetSchemeHandlerFactory);
};

}
