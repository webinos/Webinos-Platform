// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include <gtk/gtk.h>
#include <string>
#include "webinosBrowser/client_handler.h"
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "webinosBrowser/webinosBrowser.h"
#include "webinosBrowser/string_util.h"
#include "include/cef_runnable.h"

void ClientHandler::OnAddressChange(CefRefPtr<CefBrowser> browser,
                                    CefRefPtr<CefFrame> frame,
                                    const CefString& url) {
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier() && frame->IsMain() && m_EditHwnd != NULL) {
      // Set the edit window text
    std::string urlStr(url);
    gtk_entry_set_text(GTK_ENTRY(m_EditHwnd), urlStr.c_str());
  }
}

void ClientHandler::OnTitleChange(CefRefPtr<CefBrowser> browser,
                                  const CefString& title) {
  REQUIRE_UI_THREAD();

  GtkWidget* window = gtk_widget_get_ancestor(
      GTK_WIDGET(browser->GetHost()->GetWindowHandle()),
      GTK_TYPE_WINDOW);
  std::string titleStr(title);
  gtk_window_set_title(GTK_WINDOW(window), titleStr.c_str());
}

void ClientHandler::SendNotification(NotificationType type) {
 	if (type == NOTIFY_DOWNLOAD_COMPLETE) {
        std::string downloadedFile(GetLastDownloadFile());
        GtkWidget* widget = NULL;
        CefPostTask(TID_UI, NewCefRunnableFunction(AppCreateWebinosBrowser,downloadedFile,false,true,widget,0,0));
    }
}

void ClientHandler::SetLoading(bool isLoading) {
  if (m_StopHwnd == NULL)
	  return;

  if (isLoading)
    gtk_widget_set_sensitive(GTK_WIDGET(m_StopHwnd), true);
  else
    gtk_widget_set_sensitive(GTK_WIDGET(m_StopHwnd), false);
}

void ClientHandler::SetNavState(bool canGoBack, bool canGoForward) {
 if (m_BackHwnd == NULL || m_ForwardHwnd == NULL)
	 return;

  if (canGoBack)
    gtk_widget_set_sensitive(GTK_WIDGET(m_BackHwnd), true);
  else
    gtk_widget_set_sensitive(GTK_WIDGET(m_BackHwnd), false);

  if (canGoForward)
    gtk_widget_set_sensitive(GTK_WIDGET(m_ForwardHwnd), true);
  else
    gtk_widget_set_sensitive(GTK_WIDGET(m_ForwardHwnd), false);
}

void ClientHandler::CloseMainWindow() {
  // TODO(port): Close main window.
}

void ClientHandler::ShowMainWindow() 
{
  // TODO(port): Show main window.  
}

