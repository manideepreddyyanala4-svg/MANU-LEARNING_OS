/* Guided Python lessons linked to the existing employer-audited roadmap.
 * Lessons are original teaching material; user-owned learning notes are not modified.
 */
export type PythonRoadmapLesson = {
  id: string;
  shortTitle: string;
  essence: string;
  analogy: string;
  why: string;
  concepts: { label: string; explain: string }[];
  flow: [string, string, string];
  example: string;
  output: string;
  walkthrough: string[];
  deeper: { question: string; answer: string }[];
  mistakes: { mistake: string; correction: string }[];
  task: string;
  starter: string;
  checks: { name: string; code: string }[];
  hint: string;
  solution: string;
  quiz: { question: string; choices: [string, string, string]; correct: number; explain: string };
  recap: [string, string, string];
  docs: string;
};
