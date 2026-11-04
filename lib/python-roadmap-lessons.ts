import { pythonLessonsA } from './python-roadmap-lessons-a';
import { pythonLessonsB } from './python-roadmap-lessons-b';
import { pythonLessonsC } from './python-roadmap-lessons-c';
import { internshipCurriculum } from './internship-curriculum';
import type { PythonRoadmapLesson } from './python-roadmap-types';

/** Complete Python Fundamentals course: one guided lesson for each of the 24 roadmap rows. */
export const pythonRoadmapLessons: PythonRoadmapLesson[] = [
  ...pythonLessonsA, ...pythonLessonsB, ...pythonLessonsC,
];
export const pythonRoadmapModule = internshipCurriculum.find((mod) => mod.id === '01');
export const pythonRoadmapLessonById = (id: string) =>
  pythonRoadmapLessons.find((lesson) => lesson.id === id);
