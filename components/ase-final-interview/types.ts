export type InterviewPriority = 'CORE' | 'PREPARE' | 'BACKUP';

export type InterviewItem = {
  number: number;
  question: string;
  priority: InterviewPriority;
  answer: string;
  note?: string;
};

export type InterviewCategory = {
  id: string;
  title: string;
  subtitle: string;
  range: string;
  items: InterviewItem[];
};
