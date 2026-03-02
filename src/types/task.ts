export type TaskDirection = "employment" | "postgraduate" | "civil_service";
export type TaskStatus = "pending" | "completed";

export interface TaskItem {
  id: number;
  title: string;
  semester: string;
  direction: TaskDirection;
  status: TaskStatus;
  description: string;
}
