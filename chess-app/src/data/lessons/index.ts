import { STAGE0 } from './stage0';
import { STAGE1 } from './stage1';
import { STAGE2 } from './stage2';
import { STAGE3 } from './stage3';
import type { Lesson } from './types';
export { STAGES } from './stages';
export * from './types';

export const LESSONS: Lesson[] = [...STAGE0, ...STAGE1, ...STAGE2, ...STAGE3];
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
