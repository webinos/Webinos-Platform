RequestExecutionLevel admin

!define DEBUGBUILD 1
; For help check http://nsis.sourceforge.net/Docs/Chapter4.html#4.2.1

SetCompressor lzma

!define SRCROOT "..\.."
; the following folder path contains 
; |- node.exe
; |- Microsoft.VC100.CRT
; |   |- msvcp100.dll
; |   |- msvcr100.dll
; |   |- msvcp100d.dll
; |   |- msvcr100d.dll
; |- Openssl
; |   |- libeay32.dll
; |   |- ssleay32.dll
!define RedistPath "${SRCROOT}\..\WebinosRedistributables"

!define XmppModulesPath "${SRCROOT}\..\node_modules"

; The GUI elements
!include "MUI.nsh"

; Set path for windows to set the webinos in path
!include "setpath.nsi"
; To manipulate registry
!include "RegistryMacros.nsi"  
; Various functions and macros used in the installer
!include "HelperFunctions.nsi"  

; !define GEN "${SRCROOT}\dist"
; !define BIN "${GEN}\bin"

!define PRODUCT_ICON "webinos.ico"
!define INSTALLER_BANNER "installBanner.bmp"

!define PRODUCT_NAME "Webinos"
!define VERSION "v0.1-Alpha"

; XP Compatibility
!ifndef SF_SELECTED
 !define SF_SELECTED 1
!endif

;--------------------------------
;Configuration

  ;General

  OutFile "${PRODUCT_NAME}-${VERSION}-install.exe"

  ShowInstDetails show
  ShowUninstDetails show

  ;Folder selection page
  InstallDir "$PROGRAMFILES\${PRODUCT_NAME}"
  
  ;Remember install folder
  InstallDirRegKey HKCU "Software\${PRODUCT_NAME}" ""

;--------------------------------
;Modern UI Configuration

  Name "${PRODUCT_NAME} ${VERSION}"

  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${PRODUCT_NAME}, an EU funded project aiming to deliver a platform for web applications across mobile, PC, home media (TV) and in-car devices.\r\n\r\nNote that the Windows version of ${PRODUCT_NAME} only runs on XP, or higher.\r\n\r\n\r\n"

  !define MUI_COMPONENTSPAGE_TEXT_TOP "Select the components to install/upgrade.  Stop any ${PRODUCT_NAME} processes if they are running.  All DLLs are installed locally."

  !define MUI_COMPONENTSPAGE_SMALLDESC
  !define MUI_FINISHPAGE_LINK "Visit Webinos.org"
  !define MUI_FINISHPAGE_LINK_LOCATION "http://webinos.org"
  !define MUI_FINISHPAGE_NOAUTOCLOSE
  !define MUI_ABORTWARNING
  !define MUI_ICON "${PRODUCT_ICON}"
  !define MUI_UNICON "${PRODUCT_ICON}"
  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "${INSTALLER_BANNER}"
  !define MUI_UNFINISHPAGE_NOAUTOCLOSE
  !insertmacro MUI_PAGE_WELCOME
  ;!insertmacro MUI_PAGE_LICENSE "${SRCROOT}\COPYRIGHT.TXT"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  !insertmacro MUI_PAGE_FINISH
  
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES  
  !insertmacro MUI_UNPAGE_FINISH


;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English"
  
;--------------------------------
;Language Strings

  LangString DESC_SecWebinosUserSpace ${LANG_ENGLISH} "Install ${PRODUCT_NAME} user-space components."

  LangString DESC_SecWebinosPZHAuto ${LANG_ENGLISH} "Automatically start ${PRODUCT_NAME} PZH at system startup"
  
  LangString DESC_SecWebinosPZPAuto ${LANG_ENGLISH} "Automatically start ${PRODUCT_NAME} PZP at system startup"
  
  LangString DESC_SecXmppSupport ${LANG_ENGLISH} "Add ${PRODUCT_NAME} Xmpp support."
  
  LangString DESC_SecOpenSSLDLLs ${LANG_ENGLISH} "Install OpenSSL DLLs locally (may be omitted if DLLs are already installed globally)."
  
  LangString DESC_SecNodeExe ${LANG_ENGLISH} "Install Node.exe locally (may be omitted if NodeJs (version >= 0.6) is already installed globally). In this version, you must install this version of node which requires Admin privileges when running due to UAC restrictions."

  LangString DESC_SecMSVCR100DLL ${LANG_ENGLISH} "Install Microsoft Visual C++ 10.0 Runtime (may be omitted if it is already installed globally)."

  LangString DESC_SecAddPath ${LANG_ENGLISH} "Add ${PRODUCT_NAME} executable directory to the current user's PATH."

  LangString DESC_SecAddShortcuts ${LANG_ENGLISH} "Add ${PRODUCT_NAME} documentation shortcuts to the current user's Start Menu."

  LangString DESC_SecEnableContext ${LANG_ENGLISH} "Enable ${PRODUCT_NAME}'s context loging in order to provide contextual user informations."

;--------------------------------
;Reserve Files
  
  ;Things that need to be extracted on first (keep these lines before any File command!)
  ;Only useful for BZIP2 compression
  
  ReserveFile "${INSTALLER_BANNER}"
  ReserveFile "${NSISDIR}\Plugins\InstallOptions.dll"

;--------------------------------
;Installer Sections

Function .onInit
  ClearErrors

# Verify that user has admin privs
  UserInfo::GetName
  IfErrors ok
  Pop $R0
  UserInfo::GetAccountType
  Pop $R1
  StrCmp $R1 "Admin" ok
    Messagebox MB_OK "Administrator privileges required to install ${PRODUCT_NAME} [$R0/$R1]"
    Abort
  ok:

 # Extract Extra windows Resources
 # !insertmacro MUI_INSTALLOPTIONS_EXTRACT_AS "MyCustomPage.ini" "MyCustomPageName"
 # Check is node app is running
  !insertmacro CheckAppRunning
  
# Delete previous start menu
  RMDir /r $SMPROGRAMS\${PRODUCT_NAME}

FunctionEnd

;--------------------
;Pre-install section

Section -pre

SectionEnd

Section "${PRODUCT_NAME} User-Space Components" SecWebinosUserSpace
SectionIn RO

  SetOverwrite on
  
  DetailPrint "Installing Core components"
  
  SetOutPath "$INSTDIR\webinos"

  File /r /x .gitignore /x test /x pom.xml /x wrt /x wscript /x *.gyp /x obj /x *.sln /x *.vcxproj* /x *.cpp /x *.h /x *.c /x *.cc /x *.exp /x *.ilk /x *.pdb /x *.lib /x .git /x common\manager\context_manager\data\contextSettings.json "${SRCROOT}\webinos\*.*"
  
  SetOutPath "$INSTDIR\node_modules"
  
  File /r "${SRCROOT}\node_modules\*.*"
  
  SetOutPath "$INSTDIR\demo"
  
  File /r /x certificates /x *.txt /x tools /x build.xml "${SRCROOT}\demo\*.*"
  
  SetOutPath "$INSTDIR\storage"
  
  File /r "${SRCROOT}\storage\*.*"
  
  SetOutPath "$INSTDIR"
  
  File "${PRODUCT_ICON}"

SectionEnd

Section "Enable Context" SecEnableContext

SectionEnd

Section "Add Xmpp support to ${PRODUCT_NAME}" SecXmppSupport

  SetOverwrite on
  
  DetailPrint "Installing Xmpp support"
  
  SetOutPath "$INSTDIR\node_modules\"
  
  File /r /x *.exe /x *.zip /x Expat-2.0.1 /x icu /x obj /x *.gyp /x obj /x *.sln /x *.vcxproj* /x *.cpp /x *.h /x *.c /x *.cc /x *.exp /x *.ilk /x *.pdb /x *.lib /x .git "${XmppModulesPath}\*.*"
  
  SetOutPath "$INSTDIR\bin"
  
  File /r "${XmppModulesPath}\Expat-2.0.1\Bin\*.*"
  
  File /r "${XmppModulesPath}\icu\bin\*.*"

SectionEnd

Section /o "AutoStart ${PRODUCT_NAME} PZH" SecWebinosPZHAuto
	; set registry parameters to autostar pzh	
	DetailPrint "Configuring windows to autostart ${PRODUCT_NAME} PZH"
    !insertmacro WriteRegStringIfUndef HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}PZH"  "$INSTDIR\bin\node.exe $INSTDIR\demo\startPzh.js"
SectionEnd

Section /o "AutoStart ${PRODUCT_NAME} PZP" SecWebinosPZPAuto
	; set registry parameters to autostar pzp
	DetailPrint "Configuring windows to autostart ${PRODUCT_NAME} PZP"
    !insertmacro WriteRegStringIfUndef HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}PZH"  "$INSTDIR\bin\node.exe $INSTDIR\demo\startPzp.js"
SectionEnd

Section "OpenSSL DLLs" SecOpenSSLDLLs

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\Openssl\libeay32.dll"
  File "${RedistPath}\Openssl\ssleay32.dll"

SectionEnd

Section "NodeJs executable" SecNodeExe
SectionIn RO
  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\node.exe"

SectionEnd

Section "Microsoft Visual C 10.0 Runtime DLL" SecMSVCR100DLL

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\Microsoft.VC100.CRT\msvcp100.dll"
  File "${RedistPath}\Microsoft.VC100.CRT\msvcr100.dll"
!ifdef DEBUGBUILD
  File "${RedistPath}\Microsoft.VC100.CRT\msvcp100d.dll"
  File "${RedistPath}\Microsoft.VC100.CRT\msvcr100d.dll"
!endif
SectionEnd

!ifdef DEBUGBUILD
Section "Dependency debuging tools" SecDebugTools

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\depends\depends.chm"
  File "${RedistPath}\depends\depends.dll"
  File "${RedistPath}\depends\depends.exe"

SectionEnd
!endif

Section "Add ${PRODUCT_NAME} to PATH" SecAddPath

  ; remove previously set path (if any)
  Push "$INSTDIR\bin"
  Call RemoveFromPath

  ; append our bin directory to end of current user path
  Push "$INSTDIR\bin"
  Call AddToPath

SectionEnd

Section "Add Shortcuts to Start Menu" SecAddShortcuts

  ; Required to handle shortcuts properly on Vista/7
  SetShellVarContext all
  SetOverwrite on
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}\Documentation"
  WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\Documentation\${PRODUCT_NAME}.url" "InternetShortcut" "URL" "http://webinos.org"
  WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\Documentation\${PRODUCT_NAME} API.url" "InternetShortcut" "URL" "http://dev.webinos.org/deliverables/wp3/Deliverable32/API_specifications.html"
  WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\Documentation\Contact.url" "InternetShortcut" "URL" "http://dev.webinos.org/deliverables/wp3/contact.html"
 
SectionEnd

;--------------------
;Post-install section

Section -post

  SetOverwrite on
  
  ; Enable/Disable context based on user input
  SectionGetFlags ${SecEnableContext} $R0
  IntOp $R0 $R0 & ${SF_SELECTED}
  IntCmp $R0 ${SF_SELECTED} "" disableContext disableContext
  FileOpen $0 $INSTDIR\webinos\common\manager\context_manager\data\contextSettings.json w
  ;IfErrors createStartShortcutsFromError # This doesn't run well on windows XP
  FileWrite $0 "{ $\r$\n $\"contextEnabled$\" : true $\r$\n }"
  FileClose $0
  Goto createStartShortcuts

  disableContext:
  FileOpen $0 $INSTDIR\webinos\common\manager\context_manager\data\contextSettings.json w
  ;IfErrors createStartShortcutsFromError
  FileWrite $0 "{ $\r$\n $\"contextEnabled$\" : false $\r$\n }"
  FileClose $0
;  Goto createStartShortcuts
;createStartShortcutsFromError:
;  DetailPrint "An error occured opening contextSettings.json for editing!"
createStartShortcuts:  
  ; Setup Start PZH/PZP/XMPP shortcuts
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall ${PRODUCT_NAME}.lnk" "$INSTDIR\Uninstall.exe"
  
  Var /GLOBAL NodeExe
  IfFileExists "$INSTDIR\bin\node.exe" "" tryGlobalNode
	StrCpy $NodeExe "$INSTDIR\bin\node.exe"
	Goto addClientStartShortcut
 
  tryGlobalNode:
    StrCpy $NodeExe "node.exe"
    
addClientStartShortcut:
  ;Set the "start in" parameter of the shortcut
  SetOutPath "$INSTDIR\demo"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Start PZH.lnk" $NodeExe "startPzh.js" "$INSTDIR\${PRODUCT_ICON}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Start PZP.lnk" $NodeExe "startPzp.js" "$INSTDIR\${PRODUCT_ICON}"
  
  
  WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\PZP UI.url" "InternetShortcut" "URL" "http://localhost:8080/client/client.html"
  WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\PZH Admin UI.url" "InternetShortcut" "URL" "http://localhost:8082/client/pzh.html"

  SectionGetFlags ${SecXmppSupport} $R0
  IntOp $R0 $R0 & ${SF_SELECTED}
  IntCmp $R0 ${SF_SELECTED} "" writeRegistryInfo writeRegistryInfo 
    SetOutPath "$INSTDIR\webinos\common\xmpp\lib"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Start Xmpp PZP client 1.lnk" $NodeExe "pzp.js 0 w021@servicelab.org/mobile webinos" "$INSTDIR\${PRODUCT_ICON}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Start Xmpp PZP client 2.lnk" $NodeExe "pzp.js  1 w021@servicelab.org/tv webinos" "$INSTDIR\${PRODUCT_ICON}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Start Xmpp PZP client via BOSH 1.lnk" $NodeExe "node pzp.js 2 w021@servicelab.org/viabosh webinos http://xmpp.servicelab.org/jabber/" "$INSTDIR\${PRODUCT_ICON}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Start Xmpp PZP client via BOSH 2.lnk" $NodeExe "node pzp.js 3 w021@servicelab.org/viabosh2 webinos http://xmpp.servicelab.org/jabber/" "$INSTDIR\${PRODUCT_ICON}"
	WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Xmpp PZP client 1 UI.url" "InternetShortcut" "URL" "http://localhost:8000"
	WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Xmpp PZP client 2 UI.url" "InternetShortcut" "URL" "http://localhost:8010"
	WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Xmpp PZP client via BOSH 1 UI.url" "InternetShortcut" "URL" "http://localhost:8020"
	WriteINIStr "$SMPROGRAMS\${PRODUCT_NAME}\XMPP\Xmpp PZP client via BOSH 2 UI.url" "InternetShortcut" "URL" "http://localhost:8030"
  writeRegistryInfo:
  ; Store install folder in registry
  WriteRegStr HKLM SOFTWARE\${PRODUCT_NAME} "" $INSTDIR

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Show up in Add/Remove programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME} ${VERSION}"
  WriteRegExpandStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\${PRODUCT_ICON}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${VERSION}"

  ; Advise a reboot
  Messagebox MB_OK "IMPORTANT: Rebooting the system is advised in order to finalize the ${PRODUCT_NAME} installation (this is an informational message only, pressing OK will not reboot)."

SectionEnd

;--------------------------------
;Descriptions

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecWebinosUserSpace} $(DESC_SecWebinosUserSpace)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecEnableContext} $(DESC_SecEnableContext)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecXmppSupport} $(DESC_SecXmppSupport)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecWebinosPZHAuto} $(DESC_SecWebinosPZHAuto)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecWebinosPZPAuto} $(DESC_SecWebinosPZPAuto)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecOpenSSLDLLs} $(DESC_SecOpenSSLDLLs)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecNodeExe} $(DESC_SecNodeExe)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMSVCR100DLL} $(DESC_SecMSVCR100DLL)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecAddPath} $(DESC_SecAddPath)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecAddShortcuts} $(DESC_SecAddShortcuts)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
;Uninstaller Section

Function un.onInit
  ClearErrors
  UserInfo::GetName
  IfErrors ok
  Pop $R0
  UserInfo::GetAccountType
  Pop $R1
  StrCmp $R1 "Admin" ok
    Messagebox MB_OK "Administrator privileges required to uninstall ${PRODUCT_NAME} [$R0/$R1]"
    Abort
  ok:
FunctionEnd

Section "Uninstall"

  ; Required to handle shortcuts properly on Vista/7
  SetShellVarContext all

  DetailPrint "Removing ${PRODUCT_NAME} from path"
  Push "$INSTDIR\bin"
  Call un.RemoveFromPath

  
  DetailPrint "Removing shortcuts"
  RMDir /r $SMPROGRAMS\${PRODUCT_NAME}

  DetailPrint "Removing installation files"
  RMDir /r "$INSTDIR"
  
  DetailPrint "Removing registry entries"
  DeleteRegKey HKCR "${PRODUCT_NAME}File"
  DeleteRegKey HKLM SOFTWARE\${PRODUCT_NAME}
  DeleteRegKey HKCU "Software\${PRODUCT_NAME}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}PZH"
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}PZP"
  
SectionEnd
