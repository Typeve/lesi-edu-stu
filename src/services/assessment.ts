import { requestJson } from "./http";
import type {
  AssessmentResultResponse,
  QuestionsResponse,
  SubmitAnswersResponse
} from "../types/assessment";

export const assessmentApi = {
  getQuestions(token: string) {
    return requestJson<QuestionsResponse>("/student/assessments/questions", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  submitAnswers(token: string, answers: Array<{ questionId: number; score: number }>) {
    return requestJson<SubmitAnswersResponse>("/student/assessments/submissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers })
    });
  },
  getResult(token: string) {
    return requestJson<AssessmentResultResponse>("/student/assessments/result", {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
