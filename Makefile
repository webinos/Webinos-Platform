-include config.mk

BUILDTYPE ?= Release
PYTHON ?= python

# BUILDTYPE=Debug builds both release and debug builds. If you want to compile
# just the debug build, run `make -C out BUILDTYPE=Debug` instead.
ifeq ($(BUILDTYPE),Release)
all: out/Makefile webinos 
else
all: out/Makefile webinos webinos_g
endif

# The .PHONY is needed to ensure that we recursively use the out/Makefile
# to check for changes.
.PHONY: webinos webinos_g

webinos: config.gypi
	$(MAKE) -C out BUILDTYPE=Release
	ln -fs out/Release/webinos ./webinos_
	
webinos_g: config.gypi
	$(MAKE) -C out BUILDTYPE=Debug
	ln -fs out/Debug/webinos ./webinos_

config.gypi: configure
	./configure

out/Debug/webinos:
	$(MAKE) -C out BUILDTYPE=Debug

out/Makefile: common.gypi deps/node/deps/uv/uv.gyp deps/node/deps/http_parser/http_parser.gyp deps/node/deps/zlib/zlib.gyp deps/node/deps/v8/build/common.gypi deps/node/deps/v8/tools/gyp/v8.gyp deps/node/node.gyp webinos.gyp config.gypi
	tools/gyp_webinos -f make

clean:
	-rm -rf out/Makefile out/$(BUILDTYPE)/webinos
	-find out/ -name '*.o' -o -name '*.a' | xargs rm -rf

distclean:
	-rm -rf out
	-rm -f config.gypi
	-rm -f config.mk


.PHONY: clean distclean check uninstall install install-includes install-bin all program staticlib dynamiclib
