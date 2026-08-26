#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/mobile"

API_BASE_URL="${API_BASE_URL:-https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1}"
# Android versionCode max is 2100000000 — use compact YYMMDDHH
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%y%m%d%H)}"
GOOGLE_SERVER_CLIENT_ID="${GOOGLE_SERVER_CLIENT_ID:-}"

if [[ ! -f android/key.properties ]]; then
  echo "WARNING: android/key.properties missing — APK will be debug-signed."
  echo "Run scripts/create-upload-keystore.sh before Play Store upload."
fi

DEFINES=(
  "--dart-define=API_BASE_URL=${API_BASE_URL}"
  "--dart-define=ALLOW_MOCK_PAYMENTS=false"
  "--dart-define=ALLOW_DEMO_SOCIAL=false"
  "--dart-define=AGORA_APP_ID=${AGORA_APP_ID:-7e9a244ee350427f82d060d70e0bb958}"
)

if [[ -n "${AGORA_TOKEN:-}" ]]; then
  DEFINES+=("--dart-define=AGORA_TOKEN=${AGORA_TOKEN}")
fi

if [[ -n "$GOOGLE_SERVER_CLIENT_ID" ]]; then
  DEFINES+=("--dart-define=GOOGLE_SERVER_CLIENT_ID=${GOOGLE_SERVER_CLIENT_ID}")
fi

echo "Building release"
echo "API_BASE_URL=${API_BASE_URL}"
echo "ALLOW_MOCK_PAYMENTS=false ALLOW_DEMO_SOCIAL=false"

flutter pub get
flutter analyze --no-fatal-infos

case "${1:-apk}" in
  apk)
    flutter build apk --release --android-skip-build-dependency-validation "${DEFINES[@]}" --build-number="$BUILD_NUMBER"
    echo "APK: build/app/outputs/flutter-apk/app-release.apk"
    ;;
  appbundle|aab)
    flutter build appbundle --release --android-skip-build-dependency-validation "${DEFINES[@]}" --build-number="$BUILD_NUMBER"
    echo "AAB: build/app/outputs/bundle/release/app-release.aab"
    ;;
  ios)
    flutter build ios --release --no-codesign "${DEFINES[@]}" --build-number="$BUILD_NUMBER"
    echo "iOS build complete (unsigned). Archive/sign in Xcode or CI with certificates."
    ;;
  *)
    echo "Usage: $0 [apk|appbundle|ios]"
    exit 1
    ;;
esac
