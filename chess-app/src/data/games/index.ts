/** "Từng nước một": classic games with original move-by-move commentary. */
export interface AnnotatedMove { san: string; c: string }
export interface AnnotatedGame {
  id: string;
  title: string;
  theme: string;
  intro: string;
  moves: AnnotatedMove[];
  outro: string;
  lessons: string[];
}
export interface GameMeta {
  id: string;
  white: string;
  black: string;
  event: string;
  year: number;
  result: string;
  level: 1 | 2 | 3;
  /** side the reader sits on */
  side: 'w' | 'b';
  words: number;
  title: string;
  theme: string;
  plies: number;
}

import meta from './meta.json';
export const GAMES: GameMeta[] = meta as unknown as GameMeta[];

const loaders = import.meta.glob('./annotated/*.json');
export async function loadGame(id: string): Promise<AnnotatedGame | null> {
  const l = loaders[`./annotated/${id}.json`];
  if (!l) return null;
  const mod = (await l()) as { default: AnnotatedGame };
  return mod.default;
}
