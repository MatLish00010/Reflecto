// Request/Response types for feedback API
export interface CreateFeedbackRequest {
  type: 'bug' | 'feature' | 'improvement';
  title: string;
  description: string;
}

export interface UpdateFeedbackRequest {
  title?: string;
  description?: string;
}
