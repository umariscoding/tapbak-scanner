#!/usr/bin/env bash
set -e
cd /Users/umar/Desktop/tapbak/tapbak-scanner

# App Store Connect API key — authenticates to Apple with no 2FA / SMS.
export EXPO_ASC_API_KEY_PATH="/Users/umar/Desktop/tapbak/tapbak-scanner/AuthKey_9RXHN7W344.p8"
export EXPO_ASC_KEY_ID="9RXHN7W344"
export EXPO_ASC_ISSUER_ID="72f2a060-e0f2-4e99-a91d-8882ae952942"
export EAS_BUILD_NO_EXPO_GO_WARNING=true

echo "Building tapbak-app for iOS (TestFlight)…"
eas build --profile production --platform ios
