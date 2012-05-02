#pragma once

#ifdef OS_WIN
#include <comdef.h>
#include "stdafx.h"
#include <comdef.h>
#include <Wbemidl.h>
#include <windows.h>

#define _WIN32_DCOM

# pragma comment(lib, "wbemuuid.lib")
#endif

#include <fstream>
#include <iostream>
#include <string>

using namespace std;

class Utils
{
	public:
#ifdef OS_WIN
		static string WmiParam(LPCWSTR prop, string query);
#else
		static string exec(string cmd);
#endif
};
