import {
  Slice,
  type Store,
  type Text,
  toDraftModel,
} from '@blocksuite/affine/store';

import type { DocsService } from '../doc';

export async function getDocumentText(doc: Store) {
  const { MarkdownAdapter } =
    await import('@blocksuite/affine/shared/adapters');
  const excluded = new Set([
    'affine:image',
    'affine:attachment',
    'affine:embed-synced-doc',
    'affine:embed-linked-doc',
  ]);
  const blocks = doc
    .getBlocksByFlavour('affine:note')
    .flatMap(note => note.model.children)
    .filter(block => !excluded.has(block.flavour));
  const transformer = doc.getTransformer();
  const snapshot = transformer.sliceToSnapshot(
    Slice.fromModels(doc, blocks.map(toDraftModel))
  );
  const title =
    (doc.root?.props as { title?: Text } | undefined)?.title?.toString() ?? '';
  if (!snapshot) return title;
  const content = await new MarkdownAdapter(
    transformer,
    doc.provider
  ).fromSliceSnapshot({ snapshot, assets: transformer.assetsManager });
  return [title, content.file].filter(Boolean).join('\n\n');
}

export async function applyDocumentMarkdown(
  doc: Store,
  markdown: string,
  replace: boolean
) {
  if (doc.readonly) throw new Error('Esta nota está em modo de leitura.');
  const note = doc.getBlocksByFlavour('affine:note')[0]?.model;
  if (!note)
    throw new Error('Crie um bloco de nota antes de aplicar a resposta.');
  const { insertFromMarkdown } =
    await import('../../blocksuite/utils/markdown-utils');
  const previous = [...note.children];
  doc.captureSync();
  const added = await insertFromMarkdown(
    undefined,
    markdown,
    doc,
    note.id,
    previous.length
  );
  if (!added.length)
    throw new Error('Não foi possível converter a resposta em blocos.');
  // Parse and insert successfully before removing any existing content.
  if (replace)
    doc.transact(() =>
      previous.forEach(block => {
        if (doc.getBlock(block.id)) doc.deleteBlock(block.id);
      })
    );
  doc.captureSync();
}

export async function readSelectedDocuments(
  docs: DocsService,
  ids: string[],
  signal: AbortSignal
) {
  if (ids.length > 8) throw new Error('Selecione até 8 páginas por mensagem.');
  const texts: string[] = [];
  for (const id of ids) {
    signal.throwIfAborted();
    const { doc, release } = docs.open(id);
    try {
      let onAbort = () => {};
      try {
        await Promise.race([
          doc.waitForSyncReady(),
          new Promise<never>((_, reject) => {
            onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
            signal.addEventListener('abort', onAbort, { once: true });
            if (signal.aborted) onAbort();
          }),
        ]);
      } finally {
        signal.removeEventListener('abort', onAbort);
      }
      signal.throwIfAborted();
      texts.push(await getDocumentText(doc.blockSuiteDoc));
    } finally {
      release();
    }
  }
  return texts.join('\n\n---\n\n');
}
