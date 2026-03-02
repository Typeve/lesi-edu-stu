import { ApiError } from "./http";

export async function uploadCertificate(token: string, file: File): Promise<{ fileId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:3000"}/student/certificates/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError((payload as { message?: string } | null)?.message || "上传失败", response.status, payload);
  }

  return payload as { fileId: string };
}

export async function submitTaskCheckIn(
  token: string,
  taskId: number,
  payload: { fileId: string; note: string }
): Promise<{ checkInId: number; status: string }> {
  const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:3000"}/student/tasks/${taskId}/check-ins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError((data as { message?: string } | null)?.message || "打卡提交失败", response.status, data);
  }

  return data as { checkInId: number; status: string };
}
