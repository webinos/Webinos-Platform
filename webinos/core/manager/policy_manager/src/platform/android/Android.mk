# Set up the following environment variables
# NODE_ROOT: location of the node root directory (for include files)
# ANODE_ROOT: location of the anode root directory (for the libjninode binary)

# Variable definitions for Android applications
LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

# Modify this line to configure to the module name.
LOCAL_MODULE := pm

# Add any additional defines or compiler flags.
# Do not delete these existing flags as these are required
# for the included node header files.
LOCAL_CFLAGS := \
    -D__POSIX__ \
    -DBUILDING_NODE_EXTENSION \
    -include sys/select.h

LOCAL_CPPFLAGS :=

# Add any additional required directories for the include path.
# Do not delete these existing directories as these are required
# for the included node header files.
LOCAL_C_INCLUDES := $(NODE_ROOT)/src \
	$(NODE_ROOT)/deps/v8/include \
	$(NODE_ROOT)/deps/uv/include

# Add any additional required shared libraries that the addon depends on.
LOCAL_LDLIBS := \
	$(ANODE_ROOT)/libs/armeabi/libjninode.so \
        -llog

LOCAL_CPP_EXTENSION := .cc .cpp

LOCAL_SRC_FILES :=\
        ../../pm.cc \
        ../../core/policymanager/AuthorizationsSet.cpp \
        ../../core/policymanager/Condition.cpp \
        ../../core/policymanager/DataHandlingPreferences.cpp \
        ../../core/policymanager/Globals.cpp \
        ../../core/policymanager/IPolicyBase.cpp \
        ../../core/policymanager/Obligation.cpp \
        ../../core/policymanager/ObligationsSet.cpp \
        ../../core/policymanager/Policy.cpp \
        ../../core/policymanager/PolicyManager.cpp \
        ../../core/policymanager/PolicySet.cpp \
        ../../core/policymanager/ProvisionalAction.cpp \
        ../../core/policymanager/ProvisionalActions.cpp \
        ../../core/policymanager/Request.cpp \
        ../../core/policymanager/Rule.cpp \
        ../../core/policymanager/Subject.cpp \
        ../../core/policymanager/TriggersSet.cpp \
        ../../core/common.cpp \
        ../../../contrib/xmltools/tinyxml.cpp \
        ../../../contrib/xmltools/slre.cpp \
        ../../../contrib/xmltools/tinystr.cpp \
        ../../../contrib/xmltools/tinyxmlparser.cpp \
        ../../../contrib/xmltools/tinyxmlerror.cpp

LOCAL_STATIC_LIBRARIES := 

# Do not edit this line.
include $(ANODE_ROOT)/sdk/addon/build-node-addon.mk

