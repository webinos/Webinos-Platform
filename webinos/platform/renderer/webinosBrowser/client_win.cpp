// Copyright (c) 2010 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include "webinosBrowser/webinosBrowser.h"
#include <windows.h>
#include <commdlg.h>
#include <CommCtrl.h>
#include <shellapi.h>
#include <direct.h>
#include <sstream>
#include <string>
#include <algorithm>
#include "include/cef_app.h"
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_runnable.h"
#include "webinosBrowser/client_handler.h"
#include "webinosBrowser/resource.h"
#include "webinosBrowser/string_util.h"
#include "base/at_exit.h"
#include "include/cef_command_line.h"
#include "webinosBrowser/client_switches.h"
#include "webinosBrowser/WidgetSchemeHandler.h"
#include "webinosBrowser/WebinosSchemeHandler.h"
#include "webinosBrowser/WidgetConfig.h"
#include "webinosBrowser/WebinosConstants.h"

#define MAX_LOADSTRING 100
#define BUTTON_WIDTH 72
#define URLBAR_HEIGHT  24

// Global Variables:
HINSTANCE hInst;   // current instance
char szWorkingDir[MAX_PATH];  // The current working directory
CefRefPtr<ClientApp> app;

std::vector<HWND> m_browsers;

WNDPROC editWndOldProc = NULL;

// Forward declarations of functions included in this code module:
ATOM RegisterAppClass(HINSTANCE hInstance);
BOOL InitInstance(HINSTANCE, int);
LRESULT CALLBACK MainWndProc(HWND, UINT, WPARAM, LPARAM);

#if defined(OS_WIN)
// Add Common Controls to the application manifest because it's required to
// support the default tooltip implementation.
#pragma comment(linker, "/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")  // NOLINT(whitespace/line_length)
#endif
  
// Program entry point function.
int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPTSTR lpCmdLine, int nCmdShow) 
{
  UNREFERENCED_PARAMETER(hPrevInstance);
  UNREFERENCED_PARAMETER(lpCmdLine);

  base::AtExitManager exit_manager;

  CefMainArgs main_args(hInstance);
  app = new ClientApp;

  // Retrieve the current working directory.
  if (_getcwd(szWorkingDir, MAX_PATH) == NULL)
    szWorkingDir[0] = 0;

  // Parse command line arguments. The passed in values are ignored on Windows.
  AppInitCommandLine(0, NULL);

  // Execute the secondary process, if any.
  int exit_code = CefExecuteProcess(main_args, app.get());
  if (exit_code >= 0)
    return exit_code;

  CefSettings settings;

  // Populate the settings based on command line arguments.
  AppGetSettings(settings, app);

  // Enable remote debugging by default.
  settings.remote_debugging_port = 9222;

  // Initialize CEF.
  CefInitialize(main_args, settings, app.get());

  // Register the scheme handlers.
  CefRegisterSchemeHandlerFactory("wgt", "",new webinos::WidgetSchemeHandlerFactory());
  CefRegisterSchemeHandlerFactory("webinos", "",new webinos::WebinosSchemeHandlerFactory());

  HACCEL hAccelTable;

  // Initialize global strings
  RegisterAppClass(hInstance);

  // Perform application initialization
  if (!InitInstance (hInstance, nCmdShow))
    return FALSE;

  hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_WEBINOS_RENDERER));

  int result = 0;

  if (!settings.multi_threaded_message_loop) 
  {
    // Run the CEF message loop. This function will block until the application
    // recieves a WM_QUIT message.
    CefRunMessageLoop();
  } 
  else 
  {
    MSG msg;

    // Run the application message loop.
    while (GetMessage(&msg, NULL, 0, 0)) {
      if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
      }
    }

    result = static_cast<int>(msg.wParam);
  }

  // Shut down CEF.
  CefShutdown();

  return result;
}

ATOM RegisterAppClass(HINSTANCE hInstance) 
{
  WNDCLASSEX wcex;

  ZeroMemory(&wcex,sizeof(WNDCLASSEX));
  wcex.cbSize = sizeof(WNDCLASSEX);

  wcex.style         = CS_HREDRAW | CS_VREDRAW;
  wcex.lpfnWndProc   = MainWndProc;
  wcex.cbClsExtra    = 0;
  wcex.cbWndExtra    = 0;
  wcex.hInstance     = hInstance;
  wcex.hIcon         = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_WEBINOS_RENDERER));
  wcex.hCursor       = LoadCursor(NULL, IDC_ARROW);
  wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW+1);
  if (app->WebinosShowChrome())  
    wcex.lpszMenuName  = MAKEINTRESOURCE(IDC_WEBINOS_RENDERER);
  wcex.lpszClassName = WEBINOS;
  wcex.hIconSm       = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));

  return RegisterClassEx(&wcex);
}

BOOL InitInstance(HINSTANCE hInstance, int nCmdShow) 
{
  hInst = hInstance;  // Store instance handle in our global variable

  std::string url;
  if (AppGetCommandLine()->HasArguments())
  {
    CefCommandLine::ArgumentList alist;
    AppGetCommandLine()->GetArguments(alist);
    url = alist[0];
  }

  AppCreateWebinosBrowser(url, AppGetCommandLine()->HasSwitch(webinosRenderer::kWebinosWidget), AppGetCommandLine()->HasSwitch(webinosRenderer::kWebinosSideLoad), NULL);

  return TRUE;
}

// Change the zoom factor on the UI thread.
static void ModifyZoom(CefRefPtr<CefBrowser> browser, double delta) 
{
  if (CefCurrentlyOn(TID_UI)) 
  {
    browser->GetHost()->SetZoomLevel(browser->GetHost()->GetZoomLevel() + delta);
  } 
  else 
  {
    CefPostTask(TID_UI, NewCefRunnableFunction(ModifyZoom, browser, delta));
  }
}

LRESULT CALLBACK EditWndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) 
{
  CefRefPtr<ClientHandler> clientHandler = (ClientHandler*)::GetWindowLongPtr(GetParent(hWnd),GWLP_USERDATA);

  // Callback for the edit window
  switch (message) 
  {
    case WM_CHAR:
      if (wParam == VK_RETURN && clientHandler.get()) 
      {
        // When the user hits the enter key load the URL
        CefRefPtr<CefBrowser> browser = clientHandler->GetBrowser();
        wchar_t strPtr[MAX_URL_LENGTH+1] = {0};
        *((LPWORD)strPtr) = MAX_URL_LENGTH;
        LRESULT strLen = SendMessage(hWnd, EM_GETLINE, 0, (LPARAM)strPtr);
        if (strLen > 0) 
        {
          strPtr[strLen] = 0;
          browser->GetMainFrame()->LoadURL(strPtr);
        }

        return 0;
      }
  }

  return (LRESULT)CallWindowProc(editWndOldProc, hWnd, message, wParam, lParam);
}

LRESULT CALLBACK MainWndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) 
{  
  CefRefPtr<ClientHandler> clientHandler((ClientHandler*)::GetWindowLongPtr(hWnd,GWLP_USERDATA));

  // Callback for the main window
  switch (message) 
  {
    case WM_CREATE: 
    {
      m_browsers.push_back(hWnd);

      LPCREATESTRUCT pCreate = (LPCREATESTRUCT)lParam;

      // Create the single static handler class instance
      clientHandler = (ClientHandler*)pCreate->lpCreateParams;
      clientHandler->SetMainHwnd(hWnd);

      ::SetWindowLongPtr(hWnd,GWLP_USERDATA,(LONG)clientHandler.get());

      // Create the child windows used for navigation
      RECT rect;
      int x = 0;

      GetClientRect(hWnd, &rect);

      if (app->WebinosShowChrome()) 
      {
        HWND backWnd = CreateWindow(L"BUTTON", L"Back", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | WS_DISABLED, x, 0, BUTTON_WIDTH, URLBAR_HEIGHT, hWnd, (HMENU) IDC_NAV_BACK, hInst, 0);
        x += BUTTON_WIDTH;

        HWND forwardWnd = CreateWindow(L"BUTTON", L"Forward", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | WS_DISABLED, x, 0, BUTTON_WIDTH, URLBAR_HEIGHT, hWnd, (HMENU) IDC_NAV_FORWARD, hInst, 0);
        x += BUTTON_WIDTH;

        HWND reloadWnd = CreateWindow(L"BUTTON", L"Reload", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | WS_DISABLED, x, 0, BUTTON_WIDTH, URLBAR_HEIGHT, hWnd, (HMENU) IDC_NAV_RELOAD, hInst, 0);
        x += BUTTON_WIDTH;

        HWND stopWnd = CreateWindow(L"BUTTON", L"Stop", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | WS_DISABLED, x, 0, BUTTON_WIDTH, URLBAR_HEIGHT, hWnd, (HMENU) IDC_NAV_STOP, hInst, 0);
        x += BUTTON_WIDTH;

        HWND editWnd = CreateWindow(L"EDIT", 0, WS_CHILD | WS_VISIBLE | WS_BORDER | ES_LEFT | ES_AUTOVSCROLL | ES_AUTOHSCROLL| WS_DISABLED, x, 0, rect.right - BUTTON_WIDTH * 4, URLBAR_HEIGHT, hWnd, 0, hInst, 0);

        // Assign the edit window's WNDPROC to this function so that we can capture the enter key
        editWndOldProc = reinterpret_cast<WNDPROC>(GetWindowLongPtr(editWnd, GWLP_WNDPROC));
        SetWindowLongPtr(editWnd, GWLP_WNDPROC, reinterpret_cast<LONG>(EditWndProc));
        clientHandler->SetEditHwnd(editWnd);
        clientHandler->SetButtonHwnds(backWnd, forwardWnd, reloadWnd, stopWnd);

        rect.top += URLBAR_HEIGHT;
      }

      CefWindowInfo info;
      CefBrowserSettings settings;

      // Populate the settings based on command line arguments.
      AppGetBrowserSettings(settings);

      info.SetAsChild(hWnd, rect);

      CefBrowserHost::CreateBrowser(info,static_cast<CefRefPtr<CefClient> >(clientHandler), clientHandler->GetStartUrl(), settings);

      return 0;
    }
    case WM_COMMAND: 
  {
    CefRefPtr<CefBrowser> browser;
    if (clientHandler.get())
      browser = clientHandler->GetBrowser();

    int wmId    = LOWORD(wParam);
    int wmEvent = HIWORD(wParam);

    // Parse the menu selections:
    switch (wmId) 
    {
    case IDM_EXIT:
      DestroyWindow(hWnd);
      return 0;
    case ID_WARN_CONSOLEMESSAGE:
      //if (clientHandler.get()) 
      //{
      //  std::wstringstream ss;
      //  ss << L"Console messages will be written to " << std::wstring(CefString(clientHandler->GetLogFile())); 
      //  MessageBox(hWnd, ss.str().c_str(), L"Console Messages", MB_OK | MB_ICONINFORMATION);
      //}
      return 0;
    case ID_WARN_DOWNLOADCOMPLETE:
      {
        std::string downloadedFile(CefString(clientHandler->GetLastDownloadFile()));
        AppCreateWebinosBrowser(downloadedFile.c_str(),false,true,NULL);
        return 0;
      }
    case ID_WARN_DOWNLOADERROR:
      if (clientHandler.get()) 
      {
        std::wstringstream ss;
        ss << L"File \"" << std::wstring(CefString(clientHandler->GetLastDownloadFile())) << L"\" ";

        if (wmId == ID_WARN_DOWNLOADCOMPLETE)
          ss << L"downloaded successfully.";
        else
          ss << L"failed to download.";

        MessageBox(hWnd, ss.str().c_str(), L"File Download", MB_OK | MB_ICONINFORMATION);
      }
      return 0;
    case IDC_NAV_BACK:   // Back button
      if (browser.get())
        browser->GoBack();
      return 0;
    case IDC_NAV_FORWARD:  // Forward button
      if (browser.get())
        browser->GoForward();
      return 0;
    case IDC_NAV_RELOAD:  // Reload button
      if (browser.get())
        browser->Reload();
      return 0;
    case IDC_NAV_STOP:  // Stop button
      if (browser.get())
        browser->StopLoad();
      return 0;
    case ID_TESTS_ZOOM_IN:
      if (browser.get())
        ModifyZoom(browser, 0.5);
      return 0;
    case ID_TESTS_ZOOM_OUT:
      if (browser.get())
        ModifyZoom(browser, -0.5);
      return 0;
    case ID_TESTS_ZOOM_RESET:
      if (browser.get())
        browser->GetHost()->SetZoomLevel(0.0);
      return 0;
    }
    break;
  }

  case WM_PAINT:
    {
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hWnd, &ps);
    EndPaint(hWnd, &ps);
    return 0;
    }

  case WM_SETFOCUS:
    if (clientHandler.get() && clientHandler->GetBrowser()) 
    {
      // Pass focus to the browser window
      CefWindowHandle hwnd = clientHandler->GetBrowser()->GetHost()->GetWindowHandle();
      if (hwnd)
        SendMessage(hwnd, WM_SETFOCUS, wParam, NULL);
    }
    return 0;

  case WM_SIZE:
    // Minimizing resizes the window to 0x0 which causes our layout to go all
    // screwy, so we just ignore it.
    if (wParam != SIZE_MINIMIZED && clientHandler.get() && clientHandler->GetBrowser()) 
    {
        // Resize the browser window and address bar to match the new frame
        // window size
        RECT rect;
        GetClientRect(hWnd, &rect);

        HDWP hdwp = BeginDeferWindowPos(2);

        if (app->WebinosShowChrome())
        {
          rect.top += URLBAR_HEIGHT;
          int urloffset = rect.left + BUTTON_WIDTH * 4;
          hdwp = DeferWindowPos(hdwp, clientHandler->m_EditHwnd, NULL, urloffset, 0, rect.right - urloffset, URLBAR_HEIGHT, SWP_NOZORDER);
        }

        CefWindowHandle hwnd = clientHandler->GetBrowser()->GetHost()->GetWindowHandle();
        if (hwnd) 
              hdwp = DeferWindowPos(hdwp, hwnd, NULL, rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top, SWP_NOZORDER);
          
        EndDeferWindowPos(hdwp);
    }
    break;

  case WM_ERASEBKGND:
    if (clientHandler.get() && clientHandler->GetBrowser()) 
    {
      CefWindowHandle hwnd = clientHandler->GetBrowser()->GetHost()->GetWindowHandle();
      if (hwnd) {
        // Dont erase the background if the browser window has been loaded
        // (this avoids flashing)
        return 0;
      }
    }
    break;

  case WM_CLOSE:
    {
    if (clientHandler.get()) 
    {
      CefRefPtr<CefBrowser> browser = clientHandler->GetBrowser();
      if (browser.get()) 
      {
        // Let the browser window know we are about to destroy it.
        browser->GetHost()->ParentWindowWillClose();
      }
    }
    break;
    }
  case WM_DESTROY:
    {
    std::vector<HWND>::iterator it = std::find(m_browsers.begin(), m_browsers.end(),hWnd);
    if (it != m_browsers.end())
      m_browsers.erase(it);
    if (m_browsers.size() == 0)
      PostQuitMessage(0);
    return 0;
    }
  case WM_NOTIFY:
    LPNMHDR pNMH = (LPNMHDR)lParam;
    break;
  }

  return DefWindowProc(hWnd, message, wParam, lParam);
}

// Global functions
std::string AppGetWorkingDirectory() 
{
  return szWorkingDir;
}

void AppCreateWindow(CefRefPtr<ClientHandler> clientHandler, bool sideLoading, CefWindowHandle closeParent, int width, int height)
{
  DWORD windowStyle = WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN;
  RECT r = { 0, 0, width ? width : 650, height ? height : 600 };
  ::AdjustWindowRect(&r, windowStyle,false);
  
  HMODULE hInst = ::GetModuleHandle(NULL);
  HWND hWnd = CreateWindow(WEBINOS, WEBINOS, windowStyle, CW_USEDEFAULT, CW_USEDEFAULT, r.right - r.left, r.bottom - r.top, NULL, NULL, hInst, (LPVOID)clientHandler);

  if (hWnd)
  {
    if (!sideLoading)
    {
      ShowWindow(hWnd, SW_SHOW);
      UpdateWindow(hWnd);
    }
    
    if (closeParent != NULL)
    {
      ::PostMessage(closeParent, WM_CLOSE, 0, 0);
    }
  }
}
