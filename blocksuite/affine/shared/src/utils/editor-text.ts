import ptBR from './editor-text.pt-BR.json';

/** Localizes editor controls without changing stored content or command IDs. */
export function editorText(text: string): string;
export function editorText<T>(text: T): T;
export function editorText(text: unknown): unknown {
  if (
    typeof text === 'string' &&
    typeof document !== 'undefined' &&
    /^pt(?:-|$)/i.test(document.documentElement.lang)
  ) {
    return (ptBR as Record<string, string>)[text] ?? text;
  }
  return text;
}
