
#include "webinosBrowser/webinosBrowser.h"
#include <algorithm>
#include <string>
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_response.h"
#include "include/cef_request.h"
#include "include/cef_scheme.h"

#include "webinosBrowser/resource_util.h"
#include "webinosBrowser/string_util.h"
#include "webinosBrowser/util.h"
#include "googleurl/src/gurl.h"
#include "base/file_path.h"
#include "base/sys_string_conversions.h"

#if defined(OS_WIN)
#include "webinosBrowser/resource.h"
#endif

#include "webinosBrowser/WebinosSchemeHandler.h"
#include <iostream>
#include <fstream>

namespace webinos
{

WebinosSchemeHandler::WebinosSchemeHandler(void) : m_offset(0), m_statusCode(0)
{
}

WebinosSchemeHandler::~WebinosSchemeHandler(void)
{
}

bool WebinosSchemeHandler::ProcessRequest(CefRefPtr<CefRequest> request, CefRefPtr<CefCallback> callback)
{
  REQUIRE_IO_THREAD();

  bool handled = false;

  AutoLock lock_scope(this);

  //
  // Currently don't do anything here - requests are handled in ClientHandler::GetResourceHandler
  //
    
  if (handled) 
      callback->Continue();

  return handled;
}

void WebinosSchemeHandler::GetResponseHeaders(CefRefPtr<CefResponse> response, int64& response_length, CefString& redirectUrl)  
{
  REQUIRE_IO_THREAD();

  REQUIRE_IO_THREAD();

  response->SetMimeType("text/html");
  response->SetStatus(200);

  // Set the resulting response length
  response_length = m_data.length();
}

void WebinosSchemeHandler::Cancel() 
{
  REQUIRE_IO_THREAD();
}

bool WebinosSchemeHandler::ReadResponse(void* data_out, int bytes_to_read, int& bytes_read, CefRefPtr<CefCallback> callback)  
{
  REQUIRE_IO_THREAD();

  bool has_data = false;
  bytes_read = 0;

  AutoLock lock_scope(this);

  if (m_offset < m_data.length()) 
  {
    // Copy the next block of data into the buffer.
    int transfer_size = std::min(bytes_to_read, static_cast<int>(m_data.length() - m_offset));
    memcpy(data_out, m_data.c_str() + m_offset, transfer_size);
    m_offset += transfer_size;

    bytes_read = transfer_size;
    has_data = true;
  }

  return has_data;
}

}
