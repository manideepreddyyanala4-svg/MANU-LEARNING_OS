import { numpyExamplesA } from './numpy-examples-a';
import { numpyExamplesB } from './numpy-examples-b';
import { numpyExamplesC } from './numpy-examples-c';
import type { PythonCodeExample } from './python-roadmap-code-a';
import { internshipCurriculum } from './internship-curriculum';

export const numpyCodeExamples: Record<string, PythonCodeExample[]> = {
  ...numpyExamplesA,
  ...numpyExamplesB,
  ...numpyExamplesC
};
export const numpyModule = internshipCurriculum.find(m => m.id === '03');
export const numpyExampleCount = Object.values(numpyCodeExamples)
  .reduce((total, examples) => total + examples.length, 0);
