// Q&A Types
export interface Reference {
  title: string;
  source: string;
  url?: string;
}

export interface QAMessage {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  lesson_id?: string;
  references: Reference[];
}

export interface QASession {
  id: string;
  title: string;
  topic?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  lesson_id?: string;
  messages: QAMessage[];
  is_active: boolean;
}

export interface QASessionsResponse {
  sessions: QASession[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateSessionRequest {
  title?: string;
  topic?: string;
  lesson_id?: string;
}

export interface UpdateSessionRequest {
  title?: string;
  topic?: string;
}

export interface AskQuestionRequest {
  question: string;
  context?: string;
  session_id: string;
  lesson_id?: string;
}