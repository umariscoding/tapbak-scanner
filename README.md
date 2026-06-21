# Tapbak Scanner (iOS)

A lean in-store **staff scanning station** for the Tapbak loyalty platform. It
scans a customer's wallet-pass QR, adds stamps/points, and redeems rewards
against the existing backend (`https://api.tapbak.co`, endpoints under `/pass/`).

This app is intentionally **not** an admin console. Card design, branding,
analytics, billing, pass configuration, and customer enrollment stay on the
Tapbak **web** dashboard.

## Stack
- Expo (managed) + Dev Client, TypeScript
- `expo-camera` — QR scanning (`CameraView` + `onBarcodeScanned`)
- `expo-secure-store` — access/refresh tokens in the Keychain
- `@react-navigation/native` (native-stack), `@tanstack/react-query`, `axios`, `zustand`
- `expo-haptics` — success/error feedback

## Project layout
```
src/
  api/        client.ts + endpoints + auth/customers/transactions/rewards/config
  auth/       authStore (zustand) + secureStorage
  hooks/      queries.ts (React Query)
  lib/        parseQr.ts (+ test), feedback.ts
  navigation/ RootNavigator (auth stack vs app stack)
  screens/    Login, Scanner, CustomerProcess, ManualLookup, Settings
  components/  ProgressBar, SubscriptionBanner
  types/      api.ts
```

## Auth model
- Single shared vendor login per device (the backend has one User per business).
- `POST /pass/login` returns the access token **and** refresh token in the body
  (a small backend change mirrored from `verify-otp`). Both are stored in
  SecureStore.
- The axios client sends `Authorization: Bearer <access>` plus
  `Cookie: refresh_token=<refresh>` so the backend's `CookieJWTAuthentication`
  can silently rotate the access token, returned via the `X-New-Access-Token`
  header (captured in the response interceptor). A hard `401` signs out.

## Backend integration notes
- After `process-transaction` (which returns no balance and is **not
  idempotent**), the customer + rewards queries are invalidated and refetched.
- `GET /pass/customers/<id>` 404s when the customer never added their pass to a
  wallet — surfaced as a distinct message.
- Subscription is read on login; when inactive, add/redeem actions are disabled.

## Develop
```bash
npm install
npm run typecheck      # tsc --noEmit
npm test               # jest (parseQr unit tests)

# Camera needs a real device + a Dev Client build (Expo Go can't use expo-camera native scanning reliably):
npx eas build --profile development --platform ios
# then:
npx expo start --dev-client
```

## Ship to TestFlight
```bash
npx eas build --profile production --platform ios
npx eas submit --profile production --platform ios
```
Set `API_BASE_URL` per profile in `eas.json` (defaults to production).
