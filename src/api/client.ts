import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { authStore } from "../auth/authStore";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token, plus the refresh token as a Cookie so the backend's
// CookieJWTAuthentication can silently mint a new access token when the current
// one is expired (it returns it in the X-New-Access-Token response header).
apiClient.interceptors.request.use((config) => {
  const { accessToken, refreshToken } = authStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (refreshToken) {
    config.headers.Cookie = `refresh_token=${refreshToken}`;
  }
  return config;
});

// Capture rotated access tokens; sign out on a hard 401 (refresh also invalid).
apiClient.interceptors.response.use(
  (response) => {
    const rotated = response.headers["x-new-access-token"];
    if (rotated) {
      authStore.getState().setAccessToken(rotated as string);
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      void authStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);
