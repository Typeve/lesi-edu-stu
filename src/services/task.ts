import { requestJson } from "./http";

export async function uploadCertificate(file: File): Promise<{ fileId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return requestJson<{ fileId: string }>("/student/certificates/upload", {
    method: "POST",
    body: formData
  });
}

export async function submitTaskCheckIn(
  taskId: number,
  payload: { fileId: string; note: string }
): Promise<{ checkInId: number; status: string }> {
  return requestJson<{ checkInId: number; status: string }>(`/student/tasks/${taskId}/check-ins`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
