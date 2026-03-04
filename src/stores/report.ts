import { reactive } from "vue";
import { reportApi } from "../services/report";
import type { ReportDirection } from "../types/report";

interface ReportState {
  loaded: boolean;
  loadedUserId: string | null;
  jobId: number | null;
  status: string | null;
  reports: Record<ReportDirection, string>;
}

const initialReports = (): Record<ReportDirection, string> => ({
  employment: "",
  postgraduate: "",
  civil_service: ""
});

const state = reactive<ReportState>({
  loaded: false,
  loadedUserId: null,
  jobId: null,
  status: null,
  reports: initialReports()
});

export const useReportStore = () => {
  const ensureLoaded = async (userId: string) => {
    if (!userId) {
      throw new Error("未登录");
    }

    if (state.loaded && state.loadedUserId === userId) {
      return;
    }

    const result = await reportApi.generate();
    state.reports = result.reports;
    state.jobId = result.jobId;
    state.status = result.status;
    state.loaded = true;
    state.loadedUserId = userId;
  };

  const reset = () => {
    state.loaded = false;
    state.loadedUserId = null;
    state.jobId = null;
    state.status = null;
    state.reports = initialReports();
  };

  return {
    state,
    ensureLoaded,
    reset
  };
};
