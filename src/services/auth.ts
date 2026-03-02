import { requestJson } from "./http";
import type { FirstLoginVerifyPayload, FirstLoginVerifyResponse, StudentLoginResponse } from "../types/auth";

export const authApi = {
  login(payload: { studentNo: string; password: string }) {
    return requestJson<StudentLoginResponse>("/auth/student/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  firstLoginVerify(token: string, payload: FirstLoginVerifyPayload) {
    return requestJson<FirstLoginVerifyResponse>("/auth/student/first-login-verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  }
};
