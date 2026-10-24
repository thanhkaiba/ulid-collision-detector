#!/usr/bin/env sh
# Build ActivityProbe cho Linux hoặc macOS. Không cần godot-cpp, không cần scons.
set -e
cd "$(dirname "$0")"
OUT=../../bin
mkdir -p "$OUT"
case "$(uname -s)" in
  Linux)
    gcc -std=c11 -O2 -fPIC -shared -fvisibility=hidden -Wall -Wextra -Wno-cast-function-type \
      -o "$OUT/libactivity_probe.linux.x86_64.so" activity_probe.c -ldl
    echo "built $OUT/libactivity_probe.linux.x86_64.so" ;;
  Darwin)
    clang -std=c11 -O2 -shared -fvisibility=hidden -Wall -Wextra -Wno-cast-function-type \
      -arch x86_64 -arch arm64 -framework ApplicationServices \
      -o "$OUT/libactivity_probe.macos.dylib" activity_probe.c
    echo "built $OUT/libactivity_probe.macos.dylib" ;;
  *) echo "Dùng build.bat trên Windows"; exit 1 ;;
esac
