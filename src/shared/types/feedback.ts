export interface Feedback {
  id: string;
  user_id: string;
  type: 'bug' | 'feature' | 'improvement';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequest {
  type: 'bug' | 'feature' | 'improvement';
  title: string;
  description: string;
}

export interface UpdateFeedbackRequest {
  title?: string;
  description?: string;
}
