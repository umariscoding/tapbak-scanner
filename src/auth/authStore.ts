import { create } from "zustand";
import { secureStorage } from "./secureStorage";
import type { Vendor, Configuration } from "../types/api";

interface AuthState {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  vendor: Vendor | null;
  config: Configuration | null;

  hydrate: () => Promise<void>;
  signIn: (vendor: Vendor) => Promise<void>;
  setAccessToken: (token: string) => void;
  setConfig: (config: Configuration | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  vendor: null,
  config: null,

  async hydrate() {
    const [accessToken, refreshToken, vendorRaw] = await Promise.all([
      secureStorage.getAccessToken(),
      secureStorage.getRefreshToken(),
      secureStorage.getVendor(),
    ]);
    let vendor: Vendor | null = null;
    if (vendorRaw) {
      try {
        vendor = JSON.parse(vendorRaw) as Vendor;
      } catch {
        vendor = null;
      }
    }
    set({ accessToken, refreshToken, vendor, hydrated: true });
  },

  async signIn(vendor) {
    await Promise.all([
      secureStorage.setAccessToken(vendor.access_token),
      secureStorage.setRefreshToken(vendor.refresh_token),
      secureStorage.setVendor(JSON.stringify(vendor)),
    ]);
    set({ accessToken: vendor.access_token, refreshToken: vendor.refresh_token, vendor });
  },

  setAccessToken(token) {
    void secureStorage.setAccessToken(token);
    set({ accessToken: token });
  },

  setConfig(config) {
    set({ config });
  },

  async signOut() {
    await secureStorage.clear();
    set({ accessToken: null, refreshToken: null, vendor: null, config: null });
  },
}));

// Non-React access for the axios interceptors.
export const authStore = useAuthStore;
