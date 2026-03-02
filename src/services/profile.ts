import { requestJson } from "./http";
import type { EnrollmentProfileResponse } from "../types/profile";

export const profileApi = {
  getEnrollmentProfile(token: string) {
    return requestJson<EnrollmentProfileResponse>("/auth/student/enrollment-profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
