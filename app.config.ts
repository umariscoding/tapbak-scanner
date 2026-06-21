import { ExpoConfig, ConfigContext } from "expo/config";

// Base config is read from app.json and augmented here so we can inject
// environment-specific values (API base URL) and native config plugins.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Tapbak Scanner",
  slug: "tapbak-scanner",
  scheme: "tapbakscanner",
  ios: {
    ...config.ios,
    bundleIdentifier: "co.tapbak.scanner",
    supportsTablet: true,
  },
  android: {
    ...config.android,
    package: "co.tapbak.scanner",
  },
  plugins: [
    "expo-secure-store",
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
      // projectId is filled in by `eas init`; left blank for local dev.
      projectId: process.env.EAS_PROJECT_ID ?? undefined,
    },
  },
});
