import { reactive } from "vue";
import { reportApi } from "../services/report";
import type { ReportDirection } from "../types/report";

interface ReportState {
  loaded: boolean;
  jobId: number | null;
  status: string | null;
  reports: Record<ReportDirection, string>;
}

const state = reactive<ReportState>({
  loaded: false,
  jobId: null,
  status: null,
  reports: {
    employment: "",
    postgraduate: "",
    civil_service: ""
  }
});

export const useReportStore = () => {
  const ensureLoaded = async (token: string) => {
    if (state.loaded) {
      return;
    }

    const result = await reportApi.generate(token);
    state.reports = result.reports;
    state.jobId = result.jobId;
    state.status = result.status;
    state.loaded = true;
  };

  return {
    state,
    ensureLoaded
  };
};
