RequestExecutionLevel admin

!define DEBUGBUILD 0
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
; File association management
!include "FileAssociation.nsh"

; !define GEN "${SRCROOT}\dist"
; !define BIN "${GEN}\bin"

!define PRODUCT_ICON "webinos.ico"
!define INSTALLER_BANNER "installBanner.bmp"

!define PRODUCT_NAME "webinos"
!define VERSION "0.6.08"

; XP Compatibility
!ifndef SF_SELECTED
 !define SF_SELECTED 1
!endif

;--------------------------------
;Configuration

  ;General

  OutFile "${PRODUCT_NAME}-install-${VERSION}.exe"

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
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_TEXT "Start webinos now"
  !define MUI_FINISHPAGE_LINK "Visit Webinos.org"
  !define MUI_FINISHPAGE_LINK_LOCATION "http://webinos.org"
	!define MUI_FINISHPAGE_RUN_FUNCTION "FinishRun"
  !define MUI_FINISHPAGE_NOCLOSE
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

  LangString DESC_SecWebinosUserSpace ${LANG_ENGLISH} "Install ${PRODUCT_NAME} core components."
	
	LangString DESC_SecWebinosLocalPZH ${LANG_ENGLISH} "Install local PZH"

;--------------------------------
;Reserve Files
  
  ;Things that need to be extracted on first (keep these lines before any File command!)
  ;Only useful for BZIP2 compression
  
  ReserveFile "${INSTALLER_BANNER}"
  ReserveFile "${NSISDIR}\Plugins\InstallOptions.dll"

;--------------------------------
;Installer Sections

!define SHCNE_ASSOCCHANGED 0x08000000
!define SHCNF_IDLIST 0
 
Function RefreshShellIcons
  ; By jerome tremblay - april 2003
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v \
  (${SHCNE_ASSOCCHANGED}, ${SHCNF_IDLIST}, 0, 0)'
FunctionEnd

Function FinishRun
  ExecShell "" "$INSTDIR\bin\wrt\webinosNodeServiceUI.exe"
	Sleep 10000
	ExecShell "" "$INSTDIR\bin\wrt\webinosBrowser.exe"
FunctionEnd

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

/*
Section /o "Add ${PRODUCT_NAME} local PZH" SecWebinosLocalPZH
	DetailPrint "Configuring windows to autostart ${PRODUCT_NAME} PZH"

	; Service (auto starting)
	nsSCM::Install /NOUNLOAD "webinos_pzh" "webinos pzh" 16 2 "$INSTDIR\bin\wrt\webinosNodeService.exe" "" "" "" ""

SectionEnd
*/

Section "${PRODUCT_NAME} Core Components" SecWebinosUserSpace
SectionIn RO

  SetOverwrite on
  
  DetailPrint "Installing Core components"
  
  SetOutPath "$INSTDIR"
  File "${SRCROOT}\webinos_pzh.js" 
  File "${SRCROOT}\webinos_pzp.js" 
  File "${SRCROOT}\webinos_config.json"
  
  SetOutPath "$INSTDIR\webinos"
  File /r /x *.ipch /x .gitignore /x android /x test /x pom.xml /x wscript /x *.gyp /x obj /x *.sln /x *.vcxproj* /x *.sdf /x *.suo /x *.cpp /x *.h /x *.c /x *.cc /x *.exp /x *.ilk /x *.pdb /x *.lib /x .git /x common\manager\context_manager\data\contextSettings.json "${SRCROOT}\webinos\*.*"
  
  SetOutPath "$INSTDIR\node_modules" 
  File /r /x deps /x *.ipch /x .gitignore /x android /x test /x pom.xml /x wrt /x wscript /x *.gyp /x obj /x *.sln /x *.vcxproj* /x *.sdf /x *.suo /x *.cpp /x *.h /x *.c /x *.cc /x *.exp /x *.ilk /x *.pdb /x *.lib /x .git /x socket.io\node_modules\socket.io-client\node_modules\active-x-obfuscator\node_modules\zeparser\benchmark.html "${SRCROOT}\node_modules\*.*"
	
; These are required in the node_modules folder so that certificate_manager can find them.	
	File "${RedistPath}\Openssl\libeay32.dll"
  File "${RedistPath}\Openssl\ssleay32.dll"

; They are also required in the dcrypt folder (some reason they are not loaded using PATH)	
	SetOutPath "$INSTDIR\node_modules\dcrypt\build\default"
	File "${RedistPath}\Openssl\libeay32.dll"
  File "${RedistPath}\Openssl\ssleay32.dll"

  SetOutPath "$INSTDIR\webinos\test"  
  File /r /x certificates /x *.txt /x tools /x build.xml "${SRCROOT}\webinos\test\*.*"
  
;  SetOutPath "$INSTDIR\storage"
  
;  File /r "${SRCROOT}\storage\*.*"
  
  SetOutPath "$INSTDIR"
  
  File "${PRODUCT_ICON}"

  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\node.exe"
	File /r "${RedistPath}\wrt" 
	File "${RedistPath}\zip.dll"
	File "${RedistPath}\libexpat.dll"

	; Start the ui application
	WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run\" "${PRODUCT_NAME}UI"  "$INSTDIR\bin\wrt\webinosNodeServiceUI.exe"
	;WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run\" "${PRODUCT_NAME}UI"  "$INSTDIR\bin\wrt\webinosNodeServiceUI.exe"

	; set registry parameters to autostar pzp
	DetailPrint "Configuring windows to autostart ${PRODUCT_NAME} PZP"
	;!insertmacro WriteRegStringIfUndef HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}PZP"  "$INSTDIR\bin\node.exe $\"$INSTDIR\webinos_pzp.js$\""

  ; Remove PZH local option for the time being.
  Goto noPZH
	
  ; Create services based on whether user wants a local PZH or not.
  SectionGetFlags ${SecWebinosLocalPZH} $0
  IntOp $0 $0 & ${SF_SELECTED}
  IntCmp $0 ${SF_SELECTED} localPZH noPZH
	
localPZH:

	; Create PZP service with dependency on PZH service.
	nsSCM::Install /NOUNLOAD "webinos_pzp" "webinos pzp" 16 2 "$INSTDIR\bin\wrt\webinosNodeService.exe" "" "webinos_pzh" "" ""
	Goto afterPZH

noPZH:

	; Create PZP service with no dependency.
	nsSCM::Install /NOUNLOAD "webinos_pzp" "webinos pzp" 16 2 "$INSTDIR\bin\wrt\webinosNodeService.exe" "" "" "" ""

	afterPZH:
	CreateDirectory $APPDATA\webinos\wrt
	${StrRep} $1 $INSTDIR\bin "\" "\\"
	${StrRep} $2 $INSTDIR "\" "\\"
	FileOpen $0 $APPDATA\webinos\wrt\webinos_pzp.json w
	FileWrite $0 "{$\"nodePath$\": $\"$1$\",$\"workingDirectoryPath$\": $\"$2$\",$\"nodeArgs$\": $\"webinos_pzp.js --widgetServer$\",$\"instance$\": $\"0$\"}"
	FileClose $0

	${StrRep} $1 $INSTDIR\bin "\" "\\"
	${StrRep} $2 $INSTDIR "\" "\\"
	FileOpen $0 $APPDATA\webinos\wrt\webinos_pzh.json w
	FileWrite $0 "{$\"nodePath$\": $\"$1$\",$\"workingDirectoryPath$\": $\"$2$\",$\"nodeArgs$\": $\"webinos_pzh.js$\",$\"instance$\": $\"0$\"}"
	FileClose $0

	FileOpen $0 $APPDATA\webinos\wrt\webinos_stores.json w
	FileWrite $0 "[{$\"name$\": $\"Megastore$\",$\"description$\": $\"Fraunhofer FOKUS Megastore$\",$\"location$\": $\"http://webinos.fokus.fraunhofer.de/store/$\",$\"logo$\": $\"http://www.fokus.fraunhofer.de/en/fame/_images/_logos/megastore_logo.png$\"},{$\"name$\": $\"UbiApps$\",$\"description$\": $\"UbiApps demonstration webinos app store$\",$\"location$\": $\"http://webinos.two268.com/$\",$\"logo$\": $\"http://ubiapps.com/files/2012/05/ubiapps-120.png$\"}]"
	FileClose $0
	
	DetailPrint "OpenSSL DLLs" 

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\Openssl\libeay32.dll"
  File "${RedistPath}\Openssl\ssleay32.dll"

	DetailPrint "Microsoft Visual C 10.0 Runtime DLL" 

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\Microsoft.VC100.CRT\msvcp100.dll"
  File "${RedistPath}\Microsoft.VC100.CRT\msvcr100.dll"

  File "${RedistPath}\Microsoft.VC90.CRT\Microsoft.VC90.CRT.manifest"
  File "${RedistPath}\Microsoft.VC90.CRT\msvcr90.dll"
	
	DetailPrint "Bonjour binaries" 
	SetOverwrite on
	SetOutPath "$INSTDIR\bin"
	File "${RedistPath}\Bonjour\mdnsNSP.DLL"

	DetailPrint "GTK binaries" 
	SetOverwrite on
	SetOutPath "$INSTDIR\bin"
	File "${RedistPath}\GTK\freetype6.DLL"
	File "${RedistPath}\GTK\libcairo-2.DLL"
	File "${RedistPath}\GTK\libexpat-1.DLL"
	File "${RedistPath}\GTK\libfontconfig-1.DLL"
	File "${RedistPath}\GTK\zlib1.DLL"
	File "${RedistPath}\GTK\libpng14-14.DLL"
	
  SetShellVarContext all
  SetOverwrite on
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"

	; Register file association
	WriteRegStr HKCR ".wgt" "" "W3C.widget"
	WriteRegStr HKCR "W3C.widget" "" "W3C widget"
	WriteRegStr HKCR "W3C.widget\DefaultIcon" "" '"$INSTDIR\bin\wrt\webinosBrowser.exe",-108'
	WriteRegStr HKCR "W3C.widget\shell\open\command" "" '"$INSTDIR\bin\wrt\webinosBrowser.exe" --webinos-side-load "%1"'
			
	Call RefreshShellIcons
				
SectionEnd

/*
Section "Add Xmpp support to ${PRODUCT_NAME}" SecXmppSupport

  SetOverwrite on
  
  DetailPrint "Installing Xmpp support"
 
	; todo
  SetOutPath "$INSTDIR\node_modules\"
  
  File /r /x *.exe /x *.zip /x Expat-2.0.1 /x icu /x obj /x *.gyp /x obj /x *.sln /x *.vcxproj* /x *.cpp /x *.h /x *.c /x *.cc /x *.exp /x *.ilk /x *.pdb /x *.lib /x .git "${XmppModulesPath}\*.*"
  
  SetOutPath "$INSTDIR\bin"
  
  File /r "${XmppModulesPath}\Expat-2.0.1\Bin\*.*"
  
  File /r "${XmppModulesPath}\icu\bin\*.*"

SectionEnd
*/

/*
Section "OpenSSL DLLs" SecOpenSSLDLLs

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\Openssl\libeay32.dll"
  File "${RedistPath}\Openssl\ssleay32.dll"

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

Section "Bonjour binaries" SecBonjour
	SetOverwrite on
	SetOutPath "$INSTDIR\bin"
	File "${RedistPath}\Bonjour\mdnsNSP.DLL"
SectionEnd

Section "GTK binaries" SecGTK
	SetOverwrite on
	SetOutPath "$INSTDIR\bin"
	File "${RedistPath}\GTK\freetype6.DLL"
	File "${RedistPath}\GTK\libcairo-2.DLL"
	File "${RedistPath}\GTK\libexpat-1.DLL"
	File "${RedistPath}\GTK\libfontconfig-1.DLL"
	File "${RedistPath}\GTK\zlib1.DLL"
	File "${RedistPath}\GTK\libpng14-14.DLL"
SectionEnd
*/

/*
!ifdef DEBUGBUILD
Section "Dependency debuging tools" SecDebugTools

  SetOverwrite on
  SetOutPath "$INSTDIR\bin"
  File "${RedistPath}\depends\depends.chm"
  File "${RedistPath}\depends\depends.dll"
  File "${RedistPath}\depends\depends.exe"

SectionEnd
!endif
*/

/*
Section "Add ${PRODUCT_NAME} to PATH" SecAddPath

  ; remove previously set path (if any)
  Push "$INSTDIR\bin"
  Call RemoveFromPath

  ; append our bin directory to end of current user path
  Push "$INSTDIR\bin"
  Call AddToPath

SectionEnd
*/

/*
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
*/

;--------------------
;Post-install section

Section -post

  SetOverwrite on
  
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall ${PRODUCT_NAME}.lnk" "$INSTDIR\Uninstall.exe"
  
  Var /GLOBAL NodeExe
  IfFileExists "$INSTDIR\bin\node.exe" "" tryGlobalNode
	StrCpy $NodeExe "$INSTDIR\bin\node.exe"
	Goto addClientStartShortcut
 
  tryGlobalNode:
    StrCpy $NodeExe "node.exe"
    
addClientStartShortcut:
  ;Set the "start in" parameter of the shortcut
  SetOutPath "$INSTDIR"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\bin\wrt\webinosBrowser.exe"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME} service.lnk" "$INSTDIR\bin\wrt\webinosNodeServiceUI.exe"
  
  SetOutPath "$INSTDIR\webinos"
  
  writeRegistryInfo:
  ; Store install folder in registry
  WriteRegStr HKLM "SOFTWARE\${PRODUCT_NAME}\" "" $INSTDIR

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Show up in Add/Remove programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}\" "DisplayName" "${PRODUCT_NAME} ${VERSION}"
  WriteRegExpandStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}\" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}\" "DisplayIcon" "$INSTDIR\${PRODUCT_ICON}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}\" "DisplayVersion" "${VERSION}"

	; Start the services
  nsSCM::Start "webinos_pzh"
  nsSCM::Start "webinos_pzp"
  
SectionEnd

;--------------------------------
;Descriptions

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecWebinosUserSpace} $(DESC_SecWebinosUserSpace)
	!insertmacro MUI_DESCRIPTION_TEXT ${SecWebinosLocalPZH} $(DESC_SecWebinosLocalPZH)
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

  ; Stop and remove services
  nsSCM::Stop "webinos_pzp"
  nsSCM::Remove "webinos_pzp"
  nsSCM::Stop "webinos_pzh"
  nsSCM::Remove "webinos_pzh"

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

  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}UI"

  ${UnRegisterExtension} ".wgt" "W3C widget"
    
SectionEnd
