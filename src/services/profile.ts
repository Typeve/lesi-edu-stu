import { requestJson } from "./http";
import type { EnrollmentProfileResponse } from "../types/profile";

export const profileApi = {
  getEnrollmentProfile() {
    return requestJson<EnrollmentProfileResponse>("/auth/student/enrollment-profile");
  }
};
