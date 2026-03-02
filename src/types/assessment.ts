export interface LikertQuestion {
  questionId: number;
  dimension: string;
  text: string;
  order: number;
}

export interface QuestionsResponse {
  questionSetVersion: string;
  totalQuestions: number;
  questions: LikertQuestion[];
}

export interface SubmitAnswersResponse {
  submissionId: number;
  questionSetVersion: string;
  answerCount: number;
  submittedAt: string;
}

export interface AssessmentResultResponse {
  studentId: number;
  questionSetVersion: string;
  dimensionScores: {
    selfCognition: number;
    careerPlanning: number;
    executionPower: number;
  };
  recommendation: {
    direction: "employment" | "postgraduate" | "civil_service";
    summary: string;
  };
  generatedAt: string;
}
