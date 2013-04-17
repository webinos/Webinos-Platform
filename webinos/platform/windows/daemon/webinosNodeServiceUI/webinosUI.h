// MainDlg.h : interface of the CWebinosUI class
//
/////////////////////////////////////////////////////////////////////////////

#pragma once

#include "..\webinosNodeServiceManager\ServiceManager.h"

#define WM_WEBINOS_TRAY_ICON (WM_USER+1)

class CWebinosUI : public CDialogImpl<CWebinosUI>, public CUpdateUI<CWebinosUI>, public CMessageFilter, public CIdleHandler
{
  struct IPv4
  {
    UCHAR b1;
    UCHAR b2;
    UCHAR b3;
    UCHAR b4;
  };

  CRuntimeParameters m_runtime_params;
	CUserParameters m_user_params;
	CServiceParameters m_pzh_params;
	CServiceParameters m_pzp_params;
	int m_restartingPzh;
	int m_restartingPzp;
	bool m_confirmingExit;
	NOTIFYICONDATA m_trayIcon;
	class CServiceRunner* m_pzh_runner;
	class CServiceRunner* m_pzp_runner;

	void Initialise();
	void ConfirmExit();
  bool ParseArg(std::string& arg, std::string argName, std::string& argVal);
	void ShowServiceStatus(int& restarting, CServiceParameters& params, int statusCtl, int resetCtl, int outputCtl);
  void CheckForLaunchRequests();
  bool GetIP(IPv4 & myIP);

public:
	CWebinosUI();

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
		COMMAND_HANDLER(IDC_PZH_RESET_BUTTON, BN_CLICKED, OnBnClickedPzhResetButton)
		COMMAND_HANDLER(IDC_PZH_OUTPUT_CHECK, BN_CLICKED, OnBnClickedPzhShowConsoleButton)
		COMMAND_HANDLER(IDC_ENABLE_PZH_CHECK, BN_CLICKED, OnBnClickedPzhResetButton)
		COMMAND_HANDLER(IDC_RESET_BUTTON, BN_CLICKED, OnBnClickedResetButton)
		COMMAND_HANDLER(IDC_OUTPUT_CHECK, BN_CLICKED, OnBnClickedShowConsoleButton)
		COMMAND_HANDLER(IDC_ENABLE_PZP_CHECK, BN_CLICKED, OnBnClickedResetButton)
		NOTIFY_HANDLER(IDC_SYSLINK, NM_CLICK, OnNMClickSyslink)
		NOTIFY_HANDLER(IDC_PZP_SYSLINK, NM_CLICK, OnNMClickSyslink)
		NOTIFY_HANDLER(IDC_WRT_SYSLINK, NM_CLICK, OnNMClickWRTlink)
    NOTIFY_HANDLER(IDC_PZH_SYSLINK, NM_CLICK, OnNMClickPZHlink)
		COMMAND_HANDLER(IDC_SHUTDOWN_BTN, BN_CLICKED, OnBnClickedShutdownBtn)
    COMMAND_HANDLER(IDC_CLEAN_PZH_BUTTON, BN_CLICKED, OnBnClickedCleanPZHBtn)
    COMMAND_HANDLER(IDC_CLEAN_PZP_BUTTON, BN_CLICKED, OnBnClickedCleanPZPBtn)
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
	LRESULT OnBnClickedOk(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedPzhResetButton(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnNMClickSyslink(int /*idCtrl*/, LPNMHDR pNMHDR, BOOL& /*bHandled*/);
	LRESULT OnNMClickWRTlink(int /*idCtrl*/, LPNMHDR pNMHDR, BOOL& /*bHandled*/);
	LRESULT OnNMClickPZHlink(int /*idCtrl*/, LPNMHDR pNMHDR, BOOL& /*bHandled*/);
	LRESULT OnBnClickedShutdownBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
  LRESULT OnBnClickedShowConsoleButton(WORD wNotifyCode, WORD wID, HWND hWndCtl, BOOL& bHandled);
  LRESULT OnBnClickedPzhShowConsoleButton(WORD wNotifyCode, WORD wID, HWND hWndCtl, BOOL& bHandled);
	LRESULT OnBnClickedCleanPZHBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
	LRESULT OnBnClickedCleanPZPBtn(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/);
};
