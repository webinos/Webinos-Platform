#pragma once

#include "include/wrapper/cef_stream_resource_handler.h"

namespace webinos 
{

class WebinosSchemeHandler : public CefResourceHandler
{
public:
	WebinosSchemeHandler(void);
	~WebinosSchemeHandler(void);

	virtual bool ProcessRequest(CefRefPtr<CefRequest> request, CefRefPtr<CefCallback> callback) OVERRIDE;
	virtual void GetResponseHeaders(CefRefPtr<CefResponse> response, int64& response_length, CefString& redirectUrl) OVERRIDE;
	virtual bool ReadResponse(void* data_out, int bytes_to_read, int& bytes_read, CefRefPtr<CefCallback> callback) OVERRIDE;
	virtual void Cancel() OVERRIDE;

private:
  IMPLEMENT_REFCOUNTING(WebinosSchemeHandler);
  IMPLEMENT_LOCKING(WebinosSchemeHandler);

  std::string m_data;
  size_t m_offset;
  int m_statusCode;
};

// Implementation of the factory for creating widget handlers.
class WebinosSchemeHandlerFactory : public CefSchemeHandlerFactory 
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
    return new WebinosSchemeHandler();
  }

  IMPLEMENT_REFCOUNTING(WebinosSchemeHandlerFactory);
};

}
