import { requestJson } from "./http";
import type { RoleModelDirection, RoleModelResponse } from "../types/role-model";

export const roleModelApi = {
  list(direction: RoleModelDirection) {
    return requestJson<RoleModelResponse>(`/student/role-models/match?direction=${direction}`);
  }
};
