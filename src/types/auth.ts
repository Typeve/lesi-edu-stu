export interface StudentLoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  mustChangePassword: boolean;
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
