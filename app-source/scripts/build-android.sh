#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$APP_DIR/android/build_tmp"
DIST_DIR="$APP_DIR/dist"

export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/.local/android-sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/build-tools/34.0.0:$PATH"

echo "=========================================="
echo " Building NexusLab Android APK"
echo "=========================================="
echo "Java Home: $JAVA_HOME"
echo "Android Home: $ANDROID_HOME"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/classes"
mkdir -p "$DIST_DIR"

echo "-> Compiling Android resources with aapt2..."
aapt2 compile --dir "$APP_DIR/android/app/src/main/res" -o "$BUILD_DIR/compiled_res.zip"

echo "-> Linking resources and packaging assets..."
aapt2 link "$BUILD_DIR/compiled_res.zip" \
  -I "$ANDROID_HOME/platforms/android-34/android.jar" \
  --manifest "$APP_DIR/android/app/src/main/AndroidManifest.xml" \
  -o "$BUILD_DIR/unaligned.apk" \
  -A "$APP_DIR/android/app/src/main/assets" \
  --auto-add-overlay

echo "-> Compiling Java sources with javac..."
javac -source 1.8 -target 1.8 \
  -cp "$ANDROID_HOME/platforms/android-34/android.jar" \
  -d "$BUILD_DIR/classes" \
  "$APP_DIR/android/app/src/main/java/com/nexuslab/app/MainActivity.java"

echo "-> Converting bytecode to Dalvik executable with d8..."
d8 --output "$BUILD_DIR" \
  --lib "$ANDROID_HOME/platforms/android-34/android.jar" \
  "$BUILD_DIR/classes/com/nexuslab/app/MainActivity.class" \
  "$BUILD_DIR/classes/com/nexuslab/app/MainActivity\$1.class" \
  "$BUILD_DIR/classes/com/nexuslab/app/MainActivity\$2.class" \
  "$BUILD_DIR/classes/com/nexuslab/app/MainActivity\$2\$1.class" \
  "$BUILD_DIR/classes/com/nexuslab/app/MainActivity\$2\$2.class"

echo "-> Packaging classes.dex into APK..."
cd "$BUILD_DIR"
zip -u "$BUILD_DIR/unaligned.apk" classes.dex

echo "-> Optimizing 4-byte alignment with zipalign..."
zipalign -f -p 4 "$BUILD_DIR/unaligned.apk" "$BUILD_DIR/aligned.apk"

KEYSTORE="$APP_DIR/android/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "-> Generating production debug keystore..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias androiddebugkey \
    -storepass android \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=NexusLab,OU=Dev,O=NexusLab,C=VN"
fi

echo "-> Signing APK with v1/v2 signature scheme (apksigner)..."
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$DIST_DIR/NexusLab.apk" \
  "$BUILD_DIR/aligned.apk"

echo "-> Verifying APK signature..."
apksigner verify -v "$DIST_DIR/NexusLab.apk"

# Cleanup temp build
rm -rf "$BUILD_DIR"

echo "=========================================="
echo " SUCCESS! APK generated at:"
echo " $DIST_DIR/NexusLab.apk"
echo " Size: $(ls -lh "$DIST_DIR/NexusLab.apk" | awk '{print $5}')"
echo "=========================================="
