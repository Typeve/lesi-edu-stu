export interface EnrollmentProfile {
  studentNo: string;
  name: string | null;
  schoolName: string | null;
  majorName: string | null;
  score: number | null;
  admissionYear: number | null;
}

export interface EnrollmentProfileResponse {
  status: "complete" | "missing";
  profile: EnrollmentProfile | null;
}
