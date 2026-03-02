import { requestJson } from "./http";
import type { GenerateReportsResponse } from "../types/report";

export const reportApi = {
  generate(token: string) {
    return requestJson<GenerateReportsResponse>("/student/reports/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
