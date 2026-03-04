import { requestJson } from "./http";
import type { GenerateReportsResponse } from "../types/report";

export const reportApi = {
  generate() {
    return requestJson<GenerateReportsResponse>("/student/reports/generate", {
      method: "POST"
    });
  }
};
