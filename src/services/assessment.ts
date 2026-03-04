import { requestJson } from "./http";
import type {
  AssessmentResultResponse,
  QuestionsResponse,
  SubmitAnswersResponse
} from "../types/assessment";

export const assessmentApi = {
  getQuestions() {
    return requestJson<QuestionsResponse>("/student/assessments/questions");
  },
  submitAnswers(answers: Array<{ questionId: number; score: number }>) {
    return requestJson<SubmitAnswersResponse>("/student/assessments/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ answers })
    });
  },
  getResult() {
    return requestJson<AssessmentResultResponse>("/student/assessments/result");
  }
};
