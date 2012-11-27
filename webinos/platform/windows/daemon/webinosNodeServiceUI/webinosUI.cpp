#include "StdAfx.h"
#include "resource.h"
#include "WebinosUI.h"
#include <wtsapi32.h>
#include "..\webinosNodeServiceManager\StringStuff.h"

#define ID_TRAY_APP_ICON                5000
#define ID_TRAY_EXIT_CONTEXT_MENU_ITEM  3000
#define ID_POLL_TIMER						1000
#define SERVICE_POLL_INTERVAL 1000
#define SERVICE_HEARTBEAT_TIMEOUT 10

LRESULT CWebinosUI::OnInitDialog(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
	SetWindowText(PRODUCT_NAME);

	Initialise();

	// center the dialog on the screen
	CenterWindow();

	// set icons
	HICON hIcon = (HICON)::LoadImage(_Module.GetResourceInstance(), MAKEINTRESOURCE(IDR_MAINFRAME), IMAGE_ICON, ::GetSystemMetrics(SM_CXICON), ::GetSystemMetrics(SM_CYICON), LR_DEFAULTCOLOR);
	SetIcon(hIcon, TRUE);
	HICON hIconSmall = (HICON)::LoadImage(_Module.GetResourceInstance(), MAKEINTRESOURCE(IDR_MAINFRAME), IMAGE_ICON, ::GetSystemMetrics(SM_CXSMICON), ::GetSystemMetrics(SM_CYSMICON), LR_DEFAULTCOLOR);
	SetIcon(hIconSmall, FALSE);

	// Initialise tray icon
	ZeroMemory(&m_trayIcon, sizeof(NOTIFYICONDATA));
	m_trayIcon.cbSize = sizeof(NOTIFYICONDATA);  
	m_trayIcon.hWnd = m_hWnd;
	m_trayIcon.uID = ID_TRAY_APP_ICON;
	m_trayIcon.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP | NIF_INFO;
	m_trayIcon.uCallbackMessage = WM_WEBINOS_TRAY_ICON; 
	m_trayIcon.hIcon = hIconSmall;
	_tcscpy_s(m_trayIcon.szTip, _countof(m_trayIcon.szTip), PRODUCT_NAME);
	_tcscpy_s(m_trayIcon.szInfo, _countof(m_trayIcon.szInfo), (LPCTSTR)(CString(PRODUCT_NAME) + CString(" is running - double-click icon for options")));
	_tcscpy_s(m_trayIcon.szInfoTitle, _countof(m_trayIcon.szInfoTitle), (LPCTSTR)(CString(PRODUCT_NAME) + CString(" status")));
	Shell_NotifyIcon(NIM_ADD, &m_trayIcon);

	// register object for message filtering and idle updates
	CMessageLoop* pLoop = _Module.GetMessageLoop();
	ATLASSERT(pLoop != NULL);
	pLoop->AddMessageFilter(this);
	pLoop->AddIdleHandler(this);

	UIAddChildWindowContainer(m_hWnd);

	return TRUE;
}

void CWebinosUI::Initialise()
{
	m_confirmingExit = false;
	m_restartingPzh = m_restartingPzp = 0;

	// Register to receive session-change notifications.
	WTSRegisterSessionNotification(m_hWnd, NOTIFY_FOR_THIS_SESSION);

	// Set user info for this session (this will initialise m_user_params).
	SetSession();

	// Initialise the node services we are interested in.
	m_pzh_params.serviceName = WEBINOS_PZH;
	m_pzp_params.serviceName = WEBINOS_PZP;

	CServiceManager mgr;

	// Get PZH parameters.
	mgr.GetServiceParameters(m_user_params,m_pzh_params);

	// Get PZP parameters.
	mgr.GetServiceParameters(m_user_params,m_pzp_params);

	// Initialise dialog controls with configuration folders.
	SetDlgItemText(IDC_PATH_TO_NODE_EDIT,m_pzp_params.nodePath.c_str());
	SetDlgItemText(IDC_PATH_TO_WEBINOS_EDIT,m_pzp_params.workingDirectoryPath.c_str());

	// Parse node arguments to extract PZP specific params.
  std::vector<std::string> toks = webinos::split(m_pzp_params.nodeArgs.c_str(),' ');
  for (std::vector<std::string>::iterator it = toks.begin(); it != toks.end(); it++)
  {
    std::string tok = *it;
    if (tok.length() == 0)
      continue;

		std::string argVal;
		if (ParseArg(tok,_T("--auth-code=\""),argVal))
			SetDlgItemText(IDC_AUTH_CODE_EDIT,argVal.c_str());
		else if (ParseArg(tok,_T("--pzh-name=\""),argVal))
			SetDlgItemText(IDC_PZH_NAME_EDIT,argVal.c_str());
  }

	// Re-set PZH service parameters.
	m_pzh_params.instance = 0;
	mgr.SetServiceParameters(m_user_params,m_pzh_params);

	// Re-set PZP service parameters.
	m_pzp_params.instance = 0;
	mgr.SetServiceParameters(m_user_params,m_pzp_params);

	// Start timer to poll for status
	SetTimer(ID_POLL_TIMER,SERVICE_POLL_INTERVAL,NULL);
}

bool CWebinosUI::ParseArg(std::string& arg, std::string argName, std::string& argVal)
{
	bool found = false;

	if (arg.find(argName) == 0)
	{
		int endIdx = arg.find(_T("\""),argName.length());
		if (endIdx > 0)
		{
			argVal = arg.substr(argName.length(),endIdx-argName.length());
			found = true;
		}
	}

	return found;
}

void CWebinosUI::SetSession()
{
	// Set the current AppData folder for the webinos PZP service to reflect the current user name.
	TCHAR appData[MAX_PATH];
	::GetEnvironmentVariable(_T("AppData"), appData, _countof(appData));
	m_user_params.appDataPath = appData;

	CServiceManager mgr;
	mgr.SetUserParameters(m_user_params);
}

void CWebinosUI::ClearSession()
{
	CServiceManager mgr;
	mgr.ClearUserParameters();
}

LRESULT CWebinosUI::OnOK(WORD /*wNotifyCode*/, WORD wID, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	CString nodePath;
	GetDlgItemText(IDC_PATH_TO_NODE_EDIT,nodePath);
	CString workingDirectoryPath;
	GetDlgItemText(IDC_PATH_TO_WEBINOS_EDIT,workingDirectoryPath);

	if (nodePath.GetLength() == 0 || workingDirectoryPath.GetLength() == 0)
	{
		MessageBox(_T("Please fill required fields"),PRODUCT_NAME,MB_ICONINFORMATION);
	}
	else
	{
		// Get configuration folders.
    CString nodePath;
		GetDlgItemText(IDC_PATH_TO_NODE_EDIT,nodePath);
    m_pzh_params.nodePath = nodePath;
    CString workingDirPath;
		GetDlgItemText(IDC_PATH_TO_WEBINOS_EDIT,workingDirPath);
    m_pzh_params.workingDirectoryPath = workingDirPath;

		// Set PZH parameters.
		CServiceManager mgr;
		m_pzh_params.nodeArgs = _T("webinos_pzh.js");
		mgr.SetServiceParameters(m_user_params,m_pzh_params);

		// PZP uses the same paths.
		m_pzp_params.nodePath = m_pzh_params.nodePath;
		m_pzp_params.workingDirectoryPath = m_pzh_params.workingDirectoryPath;

		// Get PZP specific node args.
		CString authCode;
		GetDlgItemText(IDC_AUTH_CODE_EDIT, authCode);

		CString pzhName;
		GetDlgItemText(IDC_PZH_NAME_EDIT, pzhName);

		// Build PZP node argument string.
		TCHAR nodeArgs[MAX_PATH];
		m_pzp_params.nodeArgs = _T("webinos_pzp.js --widgetServer ");

		if (authCode.GetLength() > 0)
		{
			_stprintf_s(nodeArgs,_countof(nodeArgs),_T("--auth-code=\"%s\" "),(LPCTSTR)authCode);
			m_pzp_params.nodeArgs += nodeArgs;
		}

		if (pzhName.GetLength() > 0)
		{
			_stprintf_s(nodeArgs,_countof(nodeArgs),_T("--pzh-name=\"%s\" "),(LPCTSTR)pzhName);
			m_pzp_params.nodeArgs += nodeArgs;
		}

		// Set PZP parameters.
		mgr.SetServiceParameters(m_user_params,m_pzp_params);
	}

	return 0;
}

LRESULT CWebinosUI::OnTray(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled)
{
	bHandled = TRUE;

	switch (lParam)
	{
		case NIN_BALLOONUSERCLICK:
		{
			//ConfirmExit();			
			break;
		}
		case WM_LBUTTONDBLCLK:
			ShowWindow(SW_SHOW);
			SetForegroundWindow(m_hWnd);
			break;
		case WM_RBUTTONUP:
		{
			HMENU contextMenu = LoadMenu(_Module.GetResourceInstance(),MAKEINTRESOURCE(IDR_CONTEXT_MENU));		
			HMENU subMenu = GetSubMenu(contextMenu,0);
			POINT pt;
			GetCursorPos(&pt);
			SetForegroundWindow(m_hWnd);
			int cmd = TrackPopupMenu(subMenu,TPM_CENTERALIGN | TPM_BOTTOMALIGN | TPM_RETURNCMD | TPM_VERNEGANIMATION, pt.x, pt.y, 0, m_hWnd, NULL);
			::PostMessage(m_hWnd, WM_NULL, 0, 0);
			switch (cmd)
			{
			case ID_CONTEXT_EXIT:
				ConfirmExit();
				break;
			case ID_CONTEXT_CONFIGURE:
				ShowWindow(SW_SHOW);
				break;
			}
			break;
		}
		default:
			bHandled = FALSE;
			break;
	}

	return 0;
}

void CWebinosUI::ConfirmExit()
{
	if (!m_confirmingExit)
	{
		m_confirmingExit = true;

		if (IDYES == MessageBox("Are you sure you want to shut-down " + CString(PRODUCT_NAME) + CString("?"),PRODUCT_NAME,MB_YESNO | MB_ICONQUESTION))
		{
			DestroyWindow();
			::PostQuitMessage(0);
		}

		m_confirmingExit = false;
	}
	else
		SetForegroundWindow(m_hWnd);
}

LRESULT CWebinosUI::OnClose(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
	ShowWindow(SW_HIDE);

	m_trayIcon.uFlags = NIF_INFO;
	m_trayIcon.uTimeout = 5000;
	_tcscpy_s(m_trayIcon.szInfo, _countof(m_trayIcon.szInfo),(LPCTSTR)(CString(PRODUCT_NAME) + CString(" is running in the background.")));
	_tcscpy_s(m_trayIcon.szInfoTitle, _countof(m_trayIcon.szInfoTitle),PRODUCT_NAME);
	m_trayIcon.dwInfoFlags = NIIF_INFO;
	Shell_NotifyIcon(NIM_MODIFY,&m_trayIcon);

	return 0;
}

LRESULT CWebinosUI::OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
	WTSUnRegisterSessionNotification(m_hWnd);

	ClearSession();

	Shell_NotifyIcon(NIM_DELETE, &m_trayIcon);

	// unregister message filtering and idle updates
	CMessageLoop* pLoop = _Module.GetMessageLoop();
	ATLASSERT(pLoop != NULL);
	pLoop->RemoveMessageFilter(this);
	pLoop->RemoveIdleHandler(this);

	return 0;
}

static int CALLBACK BrowseCallbackProc(HWND hwnd,UINT uMsg, LPARAM lParam, LPARAM lpData)
{
	switch (uMsg)
	{
		case BFFM_INITIALIZED:
		{
			if (NULL != lpData)
			{
				// Set the path to the start path (specified in lpData).
				SendMessage(hwnd, BFFM_SETSELECTION, TRUE, lpData);
				// Hack to force the selected folder to be scrolled into view on Win7
				::Sleep(500);
				PostMessage(hwnd, BFFM_SETSELECTION, TRUE, lpData);
			}
		}
	}

	return 0; // The function should always return 0.
}

LRESULT CWebinosUI::OnBnClickedNodePathBrowseBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	TCHAR path[MAX_PATH];
	GetDlgItemText(IDC_PATH_TO_NODE_EDIT,path,MAX_PATH);

	BROWSEINFO bi = { 0 };
	bi.lpszTitle = _T("Select the location of your node installation, i.e. node.exe");
	bi.hwndOwner = m_hWnd;
	bi.lParam = (LPARAM)path;
	bi.lpfn = BrowseCallbackProc;
	bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE;

	LPITEMIDLIST pidl = SHBrowseForFolder ( &bi );

	if ( pidl != 0 )
	{
		// Get the name of the folder and put it in path
		SHGetPathFromIDList ( pidl, path );
		SetDlgItemText(IDC_PATH_TO_NODE_EDIT, path);
	}

	return 0;
}

LRESULT CWebinosUI::OnBnClickedWebinosPathBrowseBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	TCHAR path[MAX_PATH];
	GetDlgItemText(IDC_PATH_TO_WEBINOS_EDIT,path,MAX_PATH);

	TCHAR title[256];
	_stprintf_s(title,_countof(title),_T("Select the location of your %s installation"),PRODUCT_NAME);
	BROWSEINFO bi = { 0 };
	bi.lpszTitle = title;
	bi.hwndOwner = m_hWnd;
	bi.lParam = (LPARAM)path;
	bi.lpfn = BrowseCallbackProc;
	bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE;

	LPITEMIDLIST pidl = SHBrowseForFolder ( &bi );

	if ( pidl != 0 )
	{
		// Get the name of the folder and put it in path
		SHGetPathFromIDList ( pidl, path );
		SetDlgItemText(IDC_PATH_TO_WEBINOS_EDIT, path);
	}

	return 0;
}

void CWebinosUI::ShowServiceStatus(int& restarting, CServiceParameters& params, int statusCtl, int resetCtl)
{
	CServiceManager mgr;
	if (restarting == 0 && mgr.GetNodeHeartbeatTime(m_user_params,params) < SERVICE_HEARTBEAT_TIMEOUT)
	{
		SetDlgItemText(statusCtl,_T("running"));
		GetDlgItem(resetCtl).EnableWindow(TRUE);
	}
	else 
	{
		if (restarting > 0)
			restarting--;
		GetDlgItem(resetCtl).EnableWindow(FALSE);

		if (mgr.GetServiceHeartbeatTime(params) < SERVICE_HEARTBEAT_TIMEOUT)
		{
			if (restarting == 0)
				SetDlgItemText(statusCtl,_T("service running, but ") + CString(params.serviceName.c_str()) + CString(" is not - check configuration"));
			else
				SetDlgItemText(statusCtl,_T("restarting..."));
		}
		else
			SetDlgItemText(statusCtl,_T("hosting service not running"));
	}
}

LRESULT CWebinosUI::OnTimer(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled)
{
	//ShowServiceStatus(m_restartingPzh, m_pzh_params, IDC_PZH_STATUS_STATIC, IDC_PZH_RESET_BUTTON);
	ShowServiceStatus(m_restartingPzp, m_pzp_params, IDC_STATUS_STATIC, IDC_RESET_BUTTON);

  CheckForLaunchRequests();

	return 0;
}

LRESULT CWebinosUI::OnSessionChange(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled)
{
	switch( wParam )
	{
	case WTS_CONSOLE_CONNECT:
//		MessageBox(TEXT("WTS_CONSOLE_CONNECT"), TEXT("WM_WTSSESSION_CHANGE"), MB_OK );
		SetSession();
		break;
	case WTS_CONSOLE_DISCONNECT:
		ClearSession();
//		MessageBox(TEXT("WTS_CONSOLE_DISCONNECT"), TEXT("WM_WTSSESSION_CHANGE"), MB_OK );
		break;
	case WTS_SESSION_LOCK:
		//MessageBox(TEXT("WTS_SESSION_LOCK"), TEXT("WM_WTSSESSION_CHANGE"), MB_OK );
		break;
	case WTS_SESSION_UNLOCK:
		//MessageBox(TEXT("WTS_SESSION_UNLOCK"), TEXT("WM_WTSSESSION_CHANGE"), MB_OK );
		break;
	default:
		break;
	}

	return 0;
}

LRESULT CWebinosUI::OnBnClickedResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	CServiceManager mgr;
	m_pzp_params.instance++;
	mgr.SetServiceParameters(m_user_params,m_pzp_params);

	m_restartingPzp = 5;

	GetDlgItem(IDC_RESET_BUTTON).EnableWindow(FALSE);

	return 0;
}

LRESULT CWebinosUI::OnBnClickedPzhResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	CServiceManager mgr;
	m_pzh_params.instance++;
	mgr.SetServiceParameters(m_user_params,m_pzh_params);

	m_restartingPzh = 5;

	GetDlgItem(IDC_PZH_RESET_BUTTON).EnableWindow(FALSE);

	return 0;
}

BOOL CWebinosUI::OnIdle()
{
	return FALSE;
}

LRESULT CWebinosUI::OnNMClickSyslink(int /*idCtrl*/, LPNMHDR pNMHDR, BOOL& /*bHandled*/)
{
	PNMLINK link = (PNMLINK) pNMHDR;
	ShellExecuteW(NULL, L"open", link->item.szUrl, NULL, NULL, SW_SHOWNORMAL);

	return 0;
}

LRESULT CWebinosUI::OnCtlColorStatic(UINT,WPARAM wParam,LPARAM lParam,BOOL& bHandled)
{
	if (lParam == (LPARAM)GetDlgItem(IDC_SYSLINK).m_hWnd || lParam == (LPARAM)GetDlgItem(IDC_VERSION_STATIC).m_hWnd || lParam == (LPARAM)GetDlgItem(IDC_SHUTDOWN_BTN).m_hWnd)
	{
        HDC hdcStatic = (HDC) wParam;

		static HANDLE hbrBkgnd = NULL;
        if (hbrBkgnd == NULL)
        {
            hbrBkgnd = CreateSolidBrush(RGB(255,255,255));
        }
        return (INT_PTR)hbrBkgnd;
	}
	else
	{
		bHandled = FALSE;
		return FALSE;
	}
}
LRESULT CWebinosUI::OnBnClickedShutdownBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
{
	ConfirmExit();

	return 0;
}

void CWebinosUI::CheckForLaunchRequests()
{
  std::vector<std::string> files;
  CServiceManager mgr;
  mgr.GetLaunchFiles(m_user_params, (SERVICE_POLL_INTERVAL*2)/1000, files);

  for (std::vector<std::string>::iterator it = files.begin(); it != files.end(); it++)
  {
    std::string launch = mgr.ReadFile(*it);

    size_t cmdIdx = launch.find_first_of(':');
    if (cmdIdx != std::string::npos)
    {
      std::string launchType = launch.substr(0,cmdIdx);
      std::string appURI = launch.substr(cmdIdx+1);
            
      TCHAR browserPath[MAX_PATH];
      sprintf(browserPath,"%s\\wrt\\webinosBrowser.exe",m_pzp_params.nodePath.c_str());
      TCHAR browserParams[256];
      if (launchType == "wgt")
        sprintf(browserParams,"--webinos-widget %s",appURI.c_str());
      else
        sprintf(browserParams,"%s",appURI.c_str());
      ::ShellExecute(m_hWnd,NULL,browserPath,browserParams,NULL,SW_SHOWNORMAL);
    }

    ::DeleteFile((*it).c_str());
  }
}
