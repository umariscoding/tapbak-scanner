import * as SecureStore from "expo-secure-store";

const KEYS = {
  access: "tapbak.access_token",
  refresh: "tapbak.refresh_token",
  vendor: "tapbak.vendor",
} as const;

async function get(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function set(key: string, value: string | null): Promise<void> {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export const secureStorage = {
  keys: KEYS,
  getAccessToken: () => get(KEYS.access),
  getRefreshToken: () => get(KEYS.refresh),
  getVendor: () => get(KEYS.vendor),
  setAccessToken: (v: string | null) => set(KEYS.access, v),
  setRefreshToken: (v: string | null) => set(KEYS.refresh, v),
  setVendor: (v: string | null) => set(KEYS.vendor, v),
  async clear() {
    await Promise.all([
      set(KEYS.access, null),
      set(KEYS.refresh, null),
      set(KEYS.vendor, null),
    ]);
  },
};
