// dllmain.h : Declaration of module class.

class CpolicyShimModule : public CAtlDllModuleT< CpolicyShimModule >
{
public :
	DECLARE_LIBID(LIBID_policyShimLib)
	DECLARE_REGISTRY_APPID_RESOURCEID(IDR_POLICYSHIM, "{B07A19B5-6970-498F-8392-ADCCB8D7EC79}")
};

extern class CpolicyShimModule _AtlModule;
