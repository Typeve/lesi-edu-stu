export type ReportDirection = "employment" | "postgraduate" | "civil_service";

export interface GenerateReportsResponse {
  reports: Record<ReportDirection, string>;
  jobId: number;
  status: string;
}
