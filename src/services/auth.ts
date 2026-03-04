import { requestJson } from "./http";
import type {
  FirstLoginVerifyPayload,
  FirstLoginVerifyResponse,
  AuthUser,
  UnifiedLoginResponse
} from "../types/auth";

export const authApi = {
  login(payload: { account: string; password: string }) {
    return requestJson<UnifiedLoginResponse>("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      auth: false,
      retryOnAuthFail: false
    });
  },
  refresh() {
    return requestJson<UnifiedLoginResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      retryOnAuthFail: false
    });
  },
  logout() {
    return requestJson<{ message: string }>("/auth/logout", {
      method: "POST",
      auth: false,
      retryOnAuthFail: false
    });
  },
  me() {
    return requestJson<AuthUser>("/auth/me");
  },
  firstLoginVerify(payload: FirstLoginVerifyPayload) {
    return requestJson<FirstLoginVerifyResponse>("/auth/student/first-login-verify", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }
};
