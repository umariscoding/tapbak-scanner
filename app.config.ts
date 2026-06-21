import { ExpoConfig, ConfigContext } from "expo/config";

// Base config is read from app.json and augmented here so we can inject
// environment-specific values (API base URL) and native config plugins.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "tapbak",
  slug: "tapbak-app",
  owner: "tapbak",
  scheme: "tapbakapp",
  ios: {
    ...config.ios,
    bundleIdentifier: "co.tapbak.app",
    supportsTablet: false,
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      // App only uses standard HTTPS (exempt) — avoids the manual
      // export-compliance question on every TestFlight build.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    ...config.android,
    package: "co.tapbak.app",
  },
  plugins: [
    "expo-secure-store",
    "expo-font",
    [
      "expo-camera",
      {
        cameraPermission:
          "Tapbak uses the camera to scan customer loyalty QR codes.",
        recordAudioAndroid: false,
      },
    ],
  ],
  extra: {
    ...(config.extra ?? {}),
    apiBaseUrl: process.env.API_BASE_URL ?? "https://api.tapbak.co",
    eas: {
      projectId: "d0586884-2af4-4b93-a7eb-0511d7001283",
    },
  },
});
