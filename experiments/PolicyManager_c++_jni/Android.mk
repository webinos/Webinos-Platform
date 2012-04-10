LOCAL_PATH:= $(call my-dir)

# first lib, which will be built statically
#
include $(CLEAR_VARS)
LOCAL_C_INCLUDES := $(LOCAL_PATH)/lib/

#LOCAL_LDLIBS := -lcrypto -lssl
LOCAL_MODULE    := libpolicymanager-all
LOCAL_SRC_FILES := core/common.cpp lib/xmltools/slre.cpp lib/xmltools/tinystr.cpp lib/xmltools/tinyxml.cpp lib/xmltools/tinyxmlerror.cpp lib/xmltools/tinyxmlparser.cpp crypto/crypto.cpp crypto/CryptoManager.cpp crypto/ReferenceObject.cpp crypto/sha2.c crypto/SignatureParser.cpp core/policymanager/Condition.cpp core/policymanager/Globals.cpp core/policymanager/IPolicyBase.cpp core/policymanager/Policy.cpp core/policymanager/PolicyManager.cpp core/policymanager/PolicySet.cpp core/policymanager/Request.cpp core/policymanager/Rule.cpp core/policymanager/SecurityManager.cpp core/policymanager/SecurityManager_Android.cpp core/policymanager/Subject.cpp core/policymanager/WidgetInfo.cpp

include $(BUILD_STATIC_LIBRARY)

# second lib, which will depend on and include the first one
#
include $(CLEAR_VARS)

LOCAL_C_INCLUDES := $(LOCAL_PATH)/lib/
LOCAL_LDLIBS := -llog -lcrypto
LOCAL_MODULE    := libpolicymanager
LOCAL_SRC_FILES := native.cpp

LOCAL_STATIC_LIBRARIES := libpolicymanager-all

include $(BUILD_SHARED_LIBRARY)
