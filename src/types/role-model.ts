export type RoleModelDirection = "employment" | "postgraduate" | "civil_service";

export interface RoleModelItem {
  studentNo: string;
  name: string;
  scoreGap: number;
  tags: string[];
}

export interface RoleModelResponse {
  direction: RoleModelDirection;
  models: RoleModelItem[];
}
