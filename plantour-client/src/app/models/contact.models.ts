export interface ContactSubmissionRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  subjectCategory?: string;
  messageBody: string;
}

export interface ContactSubmissionDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  subjectCategory?: string;
  messageBody: string;
  contactStatus?: string;
  assignedAgentId?: string;
  internalNotes?: string;
  createdAt?: string;
}
