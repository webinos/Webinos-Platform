-include config.mk

BUILDTYPE ?= Release
PYTHON ?= python
DESTDIR ?=

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

webinos_g: config.gypi
	$(MAKE) -C out BUILDTYPE=Debug

config.gypi: configure
	./configure

out/Debug/webinos:
	$(MAKE) -C out BUILDTYPE=Debug

out/Makefile: common.gypi webinos.gyp config.gypi
	tools/gyp_webinos -f make

install: all
	./out/Release/webinos installer.js install $(DESTDIR)

uninstall:
	./out/Release/webinos installer.js uninstall $(DESTDIR)

clean:
	-rm -rf out

distclean:
	-rm -rf out
	-rm -f config.gypi
	-rm -f config.mk

staticlib: config.gypi
	$(MAKE) -C out BUILDTYPE=staticlib

.PHONY: clean distclean check uninstall install install-includes install-bin all program staticlib dynamiclib
