// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include <string>
#include "webinosBrowser/resource.h"
#include "webinosBrowser/webinosBrowser.h"
#include "webinosBrowser/client_handler.h"
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_runnable.h"
#include "include/cef_command_line.h"

void ClientHandler::OnAddressChange(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& url) 
{
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier() && frame->IsMain())   
  {
    // Set the edit window text
    SetWindowText(m_EditHwnd, std::wstring(url).c_str());
  }
}

void ClientHandler::OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) 
{
  REQUIRE_UI_THREAD();

  // Set the frame window title bar
  CefWindowHandle hwnd = browser->GetHost()->GetWindowHandle();
  if (m_BrowserId == browser->GetIdentifier())   
  {
    // The frame window will be the parent of the browser window
    hwnd = GetParent(hwnd);
  }
  SetWindowText(hwnd, (std::wstring(title)).c_str());
}

void ClientHandler::SendNotification(NotificationType type) 
{
  UINT id;
  switch (type) 
  {
  case NOTIFY_CONSOLE_MESSAGE:
    id = ID_WARN_CONSOLEMESSAGE;
    break;
  case NOTIFY_DOWNLOAD_COMPLETE:
    id = ID_WARN_DOWNLOADCOMPLETE;
    break;
  case NOTIFY_DOWNLOAD_ERROR:
    id = ID_WARN_DOWNLOADERROR;
    break;
  default:
    return;
  }
  PostMessage(m_MainHwnd, WM_COMMAND, id, 0);
}

void ClientHandler::SetLoading(bool isLoading) 
{
  //ASSERT(m_EditHwnd != NULL && m_ReloadHwnd != NULL && m_StopHwnd != NULL);
  EnableWindow(m_EditHwnd, TRUE);
  EnableWindow(m_ReloadHwnd, !isLoading);
  EnableWindow(m_StopHwnd, isLoading);
}

void ClientHandler::SetNavState(bool canGoBack, bool canGoForward) 
{
  //ASSERT(m_BackHwnd != NULL && m_ForwardHwnd != NULL);
  EnableWindow(m_BackHwnd, canGoBack);
  EnableWindow(m_ForwardHwnd, canGoForward);
}

void ClientHandler::ShowMainWindow() 
{
  ::ShowWindow(m_MainHwnd,SW_SHOW);
}

void ClientHandler::CloseMainWindow() 
{
  ::PostMessage(m_MainHwnd, WM_CLOSE, 0, 0);
}

void ClientHandler::Launch(CefString args) 
{
  CefRefPtr<CefCommandLine> currentCmdLine = AppGetCommandLine();
  CefString currentProgram = currentCmdLine->GetProgram();

  STARTUPINFO info={sizeof(info)};
  PROCESS_INFORMATION processInfo;
  TCHAR cmdLine[_MAX_PATH];
  swprintf_s(cmdLine,_MAX_PATH,L"%s %s",currentProgram.c_str(),args.ToWString().c_str());
  if (CreateProcess(NULL, cmdLine, NULL, NULL, FALSE, 0, NULL, NULL, &info, &processInfo))
  {
      CloseHandle(processInfo.hProcess);
      CloseHandle(processInfo.hThread);
  }
}
