import { pythonCodeExamplesA } from './python-roadmap-code-a';
import { pythonCodeExamplesB } from './python-roadmap-code-b';
import { pythonCodeExamplesC } from './python-roadmap-code-c';
import type { PythonCodeExample } from './python-roadmap-code-a';

/* Independent, labeled code references for all 24 Python Fundamentals lessons.
 * Existing lesson/progress rows are deliberately unchanged.
 * Each subtopic has a direct, stable URL fragment such as /roadmap/python/5#while-loop.
 */
export const pythonCodeExamples: Record<string, PythonCodeExample[]> = {
  ...pythonCodeExamplesA,
  ...pythonCodeExamplesB,
  ...pythonCodeExamplesC,
};
export const pythonCodeExampleCount = Object.values(pythonCodeExamples).reduce((n, examples) => n + examples.length, 0);
