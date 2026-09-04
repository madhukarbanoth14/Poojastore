#!/usr/bin/env bash
# Creates android/upload-keystore.jks + android/key.properties (gitignored).
# Run once per machine / CI secret store. Do NOT commit the keystore or passwords.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID="$ROOT/apps/mobile/android"
KEYSTORE="$ANDROID/upload-keystore.jks"
PROPS="$ANDROID/key.properties"

if [[ -f "$KEYSTORE" ]]; then
  echo "Keystore already exists: $KEYSTORE"
  exit 0
fi

STORE_PASS="${POOJA_UPLOAD_STORE_PASSWORD:-}"
KEY_PASS="${POOJA_UPLOAD_KEY_PASSWORD:-}"
if [[ -z "$STORE_PASS" || -z "$KEY_PASS" ]]; then
  echo "Set POOJA_UPLOAD_STORE_PASSWORD and POOJA_UPLOAD_KEY_PASSWORD, then re-run."
  echo "Example:"
  echo "  export POOJA_UPLOAD_STORE_PASSWORD='…'"
  echo "  export POOJA_UPLOAD_KEY_PASSWORD='…'"
  echo "  $0"
  exit 1
fi

keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias poojastore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Pavitra Seva, OU=Mobile, O=TechFy Labs, L=Hyderabad, ST=Telangana, C=IN"

cat > "$PROPS" <<EOF
storePassword=$STORE_PASS
keyPassword=$KEY_PASS
keyAlias=poojastore
storeFile=../upload-keystore.jks
EOF

echo "Created $KEYSTORE and $PROPS"
echo "Back up the keystore and passwords securely — losing them blocks Play Store updates."
