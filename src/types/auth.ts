export type AuthRole = "student" | "teacher" | "admin";

export interface AuthScope {
  schoolId?: number;
  collegeId?: number;
  majorId?: number;
  classId?: number;
}

export interface AuthUser {
  userId: string;
  role: AuthRole;
  account: string;
  displayName: string;
  studentId?: number;
  studentNo?: string;
  teacherId?: string;
  mustChangePassword?: boolean;
  scope?: AuthScope;
}

export interface SessionUser extends AuthUser {
  permissions: string[];
}

export interface UnifiedLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface FirstLoginVerifyPayload {
  name: string;
  credentialNo: string;
  schoolName: string;
  majorName: string;
}

export interface FirstLoginVerifyResponse {
  verified: boolean;
  verifiedAt: string;
}
