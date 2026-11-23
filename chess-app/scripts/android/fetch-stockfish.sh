#!/usr/bin/env bash
# Downloads the official Stockfish 17.1 Android build (arm64 + dot-product, NNUE nets embedded) into the app as a
# "native library", so Android installs it executable. Stockfish is GPL v3: https://github.com/official-stockfish/Stockfish
set -euo pipefail
cd "$(dirname "$0")/../../android"
dest=app/src/main/jniLibs/arm64-v8a
mkdir -p "$dest"
tmp=$(mktemp -d)
curl -fsSL -o "$tmp/sf.tar" https://github.com/official-stockfish/Stockfish/releases/download/sf_17.1/stockfish-android-armv8-dotprod.tar
tar -xf "$tmp/sf.tar" -C "$tmp"
cp "$tmp/stockfish/stockfish-android-armv8-dotprod" "$dest/libstockfish.so"
rm -rf "$tmp"
ls -la "$dest"
