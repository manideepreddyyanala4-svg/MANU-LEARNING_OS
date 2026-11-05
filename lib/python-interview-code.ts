import { pythonInterviewExamplesA } from './python-interview-examples-a';
import { pythonInterviewExamplesB } from './python-interview-examples-b';
import type { PythonCodeExample } from './python-roadmap-code-a';
import { internshipCurriculum } from './internship-curriculum';

export const pythonInterviewCodeExamples: Record<string, PythonCodeExample[]> = {
  ...pythonInterviewExamplesA,
  ...pythonInterviewExamplesB
};
export const pythonInterviewModule = internshipCurriculum.find(m => m.id === '02');
export const pythonInterviewExampleCount = Object.values(pythonInterviewCodeExamples).reduce((total, cards) => total + cards.length, 0);
