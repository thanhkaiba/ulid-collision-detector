#!/usr/bin/env bash
# Builds the Android app: the web app inside a WebView (Capacitor) plus the native Stockfish 17.1 binary.
# Needs JDK 21 and the Android SDK (ANDROID_HOME). Output: android/app/build/outputs/apk/release/app-release.apk
set -euo pipefail
cd "$(dirname "$0")/../.."
export ANDROID_HOME=${ANDROID_HOME:-/opt/android-sdk}
[ -f android/app/src/main/jniLibs/arm64-v8a/libstockfish.so ] || scripts/android/fetch-stockfish.sh
if [ ! -f android/app/chess-trainer.keystore ]; then
  echo "No signing key found: creating android/app/chess-trainer.keystore (keep it, later APKs must use the same key)"
  keytool -genkeypair -keystore android/app/chess-trainer.keystore -storepass android -keypass android -alias chesstrainer \
    -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Chess Trainer, O=Personal, C=VN"
fi
npm run build
# no service worker inside the app: a new APK is the update, and a cached old version must never be served
sed -i '/registerSW/d' dist/index.html
rm -f dist/sw.js dist/registerSW.js dist/workbox-*.js dist/manifest.webmanifest
npx cap sync android
cd android
./gradlew --no-daemon assembleRelease
ls -la app/build/outputs/apk/release/
