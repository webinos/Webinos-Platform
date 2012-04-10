project(MorkABTest) #a new feature descriptor
cmake_minimum_required(VERSION 2.8)

#if user does not set any build type, set default
IF(NOT CMAKE_BUILD_TYPE)
	set(CMAKE_BUILD_TYPE "RelWithDebInfo" CACHE STRING "..." FORCE)
ENDIF(NOT CMAKE_BUILD_TYPE)

#set some additional cmake modules we need
set(CMAKE_MODULE_PATH  ${PROJECT_SOURCE_DIR}/cmake-extensions/ )
find_package(PkgConfig)

set(MORK_SRC_DIR "../../src" CACHE STRING "..." FORCE)
include_directories(${MORK_SRC_DIR})

#Compile and install MorkAB library
set(MORK_LIB_SRC ${MORK_SRC_DIR}/MorkAddressBook.cpp ${MORK_SRC_DIR}/MorkParser.cpp)
set(MORK_LIB_NAME MorkAB)
add_library(${MORK_LIB_NAME} SHARED ${MORK_LIB_SRC})

install(TARGETS ${MORK_LIB_NAME} LIBRARY DESTINATION ${MorkABTest_BINARY_DIR}/lib )

#Compile and install MorkAB test program
include_directories(${PROJECT_SOURCE_DIR}/src)
link_directories(${PROJECT_BINARY_DIR}/src)
set(EXE_NAME test)
set(EXE_SRC main.cpp)
add_executable(${EXE_NAME} ${EXE_SRC})
set_target_properties(${EXE_NAME} PROPERTIES INSTALL_RPATH "${PROJECT_BINARY_DIR}/src")
target_link_libraries(${EXE_NAME} ${MORK_LIB_NAME})
install(TARGETS ${EXE_NAME} DESTINATION ${PROJECT_BINARY_DIR})
