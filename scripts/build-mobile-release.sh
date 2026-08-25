#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/mobile"

API_BASE_URL="${API_BASE_URL:-https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1}"
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"

DEFINES=(
  "--dart-define=API_BASE_URL=${API_BASE_URL}"
  "--dart-define=ALLOW_MOCK_PAYMENTS=false"
  "--dart-define=ALLOW_DEMO_SOCIAL=true"
)

echo "Building release with ALLOW_MOCK_PAYMENTS=false"
echo "API_BASE_URL=${API_BASE_URL}"

flutter pub get
flutter analyze

case "${1:-apk}" in
  apk)
    flutter build apk --release "${DEFINES[@]}" --build-number="$BUILD_NUMBER"
    echo "APK: build/app/outputs/flutter-apk/app-release.apk"
    ;;
  appbundle|aab)
    flutter build appbundle --release "${DEFINES[@]}" --build-number="$BUILD_NUMBER"
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
