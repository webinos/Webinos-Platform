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
	ln -fs out/Release/webinos webinos

webinos_g: config.gypi
	$(MAKE) -C out BUILDTYPE=Debug
	ln -fs out/Debug/webinos webinos_g

config.gypi: configure
	./configure

out/Debug/webinos:
	$(MAKE) -C out BUILDTYPE=Debug

out/Makefile: common.gypi ../node/deps/uv/uv.gyp ../node/deps/http_parser/http_parser.gyp ../node/deps/zlib/zlib.gyp ../node/deps/v8/build/common.gypi ../node/deps/v8/tools/gyp/v8.gyp ../node/node.gyp webinos.gyp config.gypi
	tools/gyp_webinos -f make

install: all
	out/Release/webinos tools/installer.js ./config.gypi install

uninstall:
	out/Release/webinos tools/installer.js ./config.gypi uninstall

clean:
	-rm -rf out/Makefile ./webinos ./webinos_g out/$(BUILDTYPE)/webinos
	-find out/ -name '*.o' -o -name '*.a' | xargs rm -rf

distclean:
	-rm -rf out
	-rm -f config.gypi
	-rm -f config.mk


.PHONY: clean distclean check uninstall install install-includes install-bin all program staticlib dynamiclib
