import { pandasExamplesA } from './pandas-examples-a';
import { pandasExamplesB } from './pandas-examples-b';
import { pandasExamplesC } from './pandas-examples-c';
import type { PythonCodeExample } from './python-roadmap-code-a';
import { internshipCurriculum } from './internship-curriculum';

/** 20 complete Module 04 lessons. Synthetic data only, no lab datasets. */
export const pandasCodeExamples: Record<string, PythonCodeExample[]> = {
  ...pandasExamplesA,
  ...pandasExamplesB,
  ...pandasExamplesC
};
export const pandasModule = internshipCurriculum.find(m => m.id === '04');
export const pandasExampleCount = Object.values(pandasCodeExamples)
  .reduce((total, examples) => total + examples.length, 0);
