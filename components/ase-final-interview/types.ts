export type InterviewPriority = 'CORE' | 'PREPARE' | 'BACKUP';

export type InterviewItem = {
  number: number;
  question: string;
  priority: InterviewPriority;
  answer: string;
  note?: string;
  memory: string;
  story?: string;
  seconds: string;
  needsFact?: string;
};

export type InterviewCategory = {
  id: string;
  title: string;
  subtitle: string;
  range: string;
  items: InterviewItem[];
};
