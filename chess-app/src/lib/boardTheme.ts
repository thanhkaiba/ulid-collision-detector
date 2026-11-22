/**
 * Board colours. Applied as CSS variables through a data attribute on <html>, read synchronously at start-up
 * from localStorage so the board never flashes in the wrong colours.
 */
export type BoardThemeId = 'green' | 'brown' | 'blue' | 'gray';

export const BOARD_THEMES: { id: BoardThemeId; label: string; light: string; dark: string }[] = [
  { id: 'green', label: 'Xanh lá', light: '#ebecd0', dark: '#779556' },
  { id: 'brown', label: 'Gỗ', light: '#f0d9b5', dark: '#b58863' },
  { id: 'blue', label: 'Xanh biển', light: '#e3e9ee', dark: '#7d98ad' },
  { id: 'gray', label: 'Đá xám', light: '#e2e2de', dark: '#8f9690' },
];

const KEY = 'board-theme';

export function currentBoardTheme(): BoardThemeId {
  try {
    const v = localStorage.getItem(KEY) as BoardThemeId | null;
    if (v && BOARD_THEMES.some((t) => t.id === v)) return v;
  } catch {
    /* ignore */
  }
  return 'green';
}

export function applyBoardTheme(id: BoardThemeId = currentBoardTheme()) {
  document.documentElement.dataset.board = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}
