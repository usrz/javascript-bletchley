#!/bin/sh

./node_modules/requirejs/bin/r.js -o \
    name=crypto \
    out=crypto.js \
    baseUrl=src \
    optimize=none
