#!/bin/bash
# This script is used to start an android emulator. It is based on the emulator-start script by
# https://gist.github.com/stackedsax/2639601. Credits to the author.

# start the AVD
# This starts the emulator
function startEmulator {
    local avd=$2
    local CONSOLE_PORT=$1
    echo "[emulator-$CONSOLE_PORT] Starting emulator with avd $avd and console port $CONSOLE_PORT"
    emulator -avd $avd -port $CONSOLE_PORT -no-window &

    # This waits for emulator to start up
    echo "[emulator-$CONSOLE_PORT] Waiting for emulator to boot completely"
    wait_for_boot_complete "getprop dev.bootcomplete" 1
    wait_for_boot_complete "getprop sys.boot_completed" 1
    wait_for_boot_complete "pm path android" package
    #The order of additional info attached to Ready is relied upon by other functions to be exact
    echo "EmulatorReady \t emulator-$CONSOLE_PORT,$CONSOLE_PORT,$avd"
    return 1
}
 
# function to really, really check things are booted up
function wait_for_boot_complete {
    local boot_property=$1
    local boot_property_test=$2
    echo "[emulator-$CONSOLE_PORT] Checking $boot_property..."
    local result=`adb -s emulator-$CONSOLE_PORT shell $boot_property 2>/dev/null | grep "$boot_property_test"`
    while [ -z $result ]; do
        sleep 1
        result=`adb -s emulator-$CONSOLE_PORT shell $boot_property 2>/dev/null | grep "$boot_property_test"`
    done
    echo "[emulator-$CONSOLE_PORT] $boot_property check was successful"
}

startEmulator $1 $2

