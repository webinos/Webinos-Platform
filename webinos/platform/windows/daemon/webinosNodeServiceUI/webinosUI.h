// MainDlg.h : interface of the CWebinosUI class
//
/////////////////////////////////////////////////////////////////////////////

#pragma once

#include "..\webinosNodeServiceManager\ServiceManager.h"

#define WM_WEBINOS_TRAY_ICON (WM_USER+1)

class CWebinosUI : public CDialogImpl<CWebinosUI>, public CUpdateUI<CWebinosUI>, public CMessageFilter, public CIdleHandler
{
	CUserParameters m_user_params;
	CServiceParameters m_pzh_params;
	CServiceParameters m_pzp_params;
	int m_restartingPzh;
	int m_restartingPzp;
	bool m_confirmingExit;
	NOTIFYICONDATA m_trayIcon;

	void Initialise();
	void ConfirmExit();
	void SetSession();
	void ClearSession();
  bool ParseArg(std::string& arg, std::string argName, std::string& argVal);
	void ShowServiceStatus(int& restarting, CServiceParameters& params, int statusCtl, int resetCtl);
  void CheckForLaunchRequests();

public:
	enum { IDD = IDD_UIDIALOG };

	virtual BOOL PreTranslateMessage(MSG* pMsg)
	{
		return CWindow::IsDialogMessage(pMsg);
	}

	virtual BOOL OnIdle();

	BEGIN_UPDATE_UI_MAP(CWebinosUI)
	END_UPDATE_UI_MAP()

	BEGIN_MSG_MAP(CWebinosUI)
		MESSAGE_HANDLER(WM_INITDIALOG, OnInitDialog)
		MESSAGE_HANDLER(WM_CLOSE, OnClose)
		MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
		MESSAGE_HANDLER(WM_WEBINOS_TRAY_ICON, OnTray)
		MESSAGE_HANDLER(WM_TIMER,OnTimer);
		MESSAGE_HANDLER(WM_WTSSESSION_CHANGE,OnSessionChange)
		MESSAGE_HANDLER(WM_CTLCOLORSTATIC,OnCtlColorStatic)
		COMMAND_ID_HANDLER(IDOK, OnOK)
		COMMAND_HANDLER(IDC_NODE_PATH_BROWSE_BTN, BN_CLICKED, OnBnClickedNodePathBrowseBtn)
		COMMAND_HANDLER(IDC_WEBINOS_PATH_BROWSE_BTN, BN_CLICKED, OnBnClickedWebinosPathBrowseBtn)
		COMMAND_HANDLER(IDC_RESET_BUTTON, BN_CLICKED, OnBnClickedResetButton)
		COMMAND_HANDLER(IDC_PZH_RESET_BUTTON, BN_CLICKED, OnBnClickedPzhResetButton)
		NOTIFY_HANDLER(IDC_SYSLINK, NM_CLICK, OnNMClickSyslink)
		NOTIFY_HANDLER(IDC_PZP_SYSLINK, NM_CLICK, OnNMClickSyslink)
		NOTIFY_HANDLER(IDC_PZH_SYSLINK, NM_CLICK, OnNMClickSyslink)
		COMMAND_HANDLER(IDC_SHUTDOWN_BTN, BN_CLICKED, OnBnClickedShutdownBtn)
	END_MSG_MAP()

// Handler prototypes (uncomment arguments if needed):
//	LRESULT MessageHandler(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
//	LRESULT CommandHandler(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
//	LRESULT NotifyHandler(int /*idCtrl*/, LPNMHDR /*pnmh*/, BOOL& /*bHandled*/)

	LRESULT OnInitDialog(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnClose(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnTray(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnTimer(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnSessionChange(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
	LRESULT OnCtlColorStatic(UINT,WPARAM,LPARAM,BOOL&);
	LRESULT OnOK(WORD /*wNotifyCode*/, WORD wID, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedNodePathBrowseBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedWebinosPathBrowseBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedOk(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedPzhResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnNMClickSyslink(int /*idCtrl*/, LPNMHDR pNMHDR, BOOL& /*bHandled*/);
	LRESULT OnBnClickedShutdownBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
};
