import { Modal } from '@affine/component';
import { LitTextRenderer } from '@affine/core/blocksuite/ai/components/text-renderer';
import { DocsService } from '@affine/core/modules/doc';
import { WorkbenchService } from '@affine/core/modules/workbench';
import type { Store } from '@blocksuite/affine/store';
import { useService } from '@toeverything/infra';
import { useState } from 'react';

import { applyDocumentMarkdown } from '../../modules/local-ai/document';
import * as chat from './chat.css';
import * as styles from './styles.css';

const rendererOptions = { customHeading: true, scrollable: false };
const previewPolicy =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; worker-src 'none'";

export function ReplyActions({
  content,
  doc,
  readonly,
  onStatus,
}: {
  content: string;
  doc?: Store;
  readonly: boolean;
  onStatus: (status: string) => void;
}) {
  const docs = useService(DocsService);
  const workbench = useService(WorkbenchService).workbench;
  const [preview, setPreview] = useState<'note' | 'page' | 'app' | null>(null);
  const [applying, setApplying] = useState(false);
  const html = content.match(/```html\s*\n([\s\S]*?)```/i)?.[1];

  const apply = async (replace: boolean) => {
    setApplying(true);
    try {
      if (preview === 'page') {
        const title =
          content.match(/^#\s+(.+)$/m)?.[1]?.slice(0, 100) ??
          'Página criada com IA';
        const record = docs.createDoc({ title });
        const opened = docs.open(record.id);
        try {
          await applyDocumentMarkdown(opened.doc.blockSuiteDoc, content, false);
        } finally {
          opened.release();
        }
        workbench.openDoc(record.id);
        onStatus('Página criada.');
      } else if (doc) {
        await applyDocumentMarkdown(doc, content, replace);
        onStatus(
          replace
            ? 'Texto da nota atualizado. Use Desfazer para reverter.'
            : 'Resposta acrescentada ao final da nota.'
        );
      }
      setPreview(null);
    } catch (error) {
      onStatus(
        error instanceof Error
          ? error.message
          : 'Não foi possível aplicar a resposta.'
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div className={styles.actions}>
        <button
          className={chat.quietButton}
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(content).then(
              () => onStatus('Resposta copiada.'),
              () => onStatus('Não foi possível copiar a resposta.')
            );
          }}
        >
          Copiar
        </button>
        {doc && !readonly && (
          <button
            className={chat.quietButton}
            type="button"
            onClick={() => setPreview('note')}
          >
            Inserir na nota
          </button>
        )}
        <button
          className={chat.quietButton}
          type="button"
          onClick={() => setPreview('page')}
        >
          Criar página
        </button>
        {html && (
          <button
            className={chat.quietButton}
            type="button"
            onClick={() => setPreview('app')}
          >
            Executar prévia HTML
          </button>
        )}
      </div>
      <Modal
        open={preview !== null}
        onOpenChange={open => {
          if (!open && !applying) setPreview(null);
        }}
        width="min(900px, calc(100vw - 32px))"
        contentOptions={{
          style: { maxHeight: '85vh', overflow: 'auto', padding: 24 },
        }}
      >
        <h2 className={chat.heading}>
          {preview === 'app'
            ? 'Prévia do aplicativo'
            : 'Revisar antes de aplicar'}
        </h2>
        {preview === 'app' ? (
          <>
            <p className={styles.muted}>
              Código executado em um quadro isolado, sem acesso às suas notas ou
              chave de API. Recursos externos são bloqueados pela política de
              conteúdo.
            </p>
            <iframe
              title="Prévia HTML isolada"
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              className={chat.appPreview}
              srcDoc={`<!doctype html><meta http-equiv="Content-Security-Policy" content="${previewPolicy}">${html ?? ''}`}
            />
          </>
        ) : (
          <>
            <p className={styles.muted}>
              {preview === 'page'
                ? 'Crie uma página com a resposta, preservando títulos, listas e tabelas.'
                : 'Acrescente a resposta ou substitua o texto do primeiro bloco de nota. Outros blocos do quadro e o título são preservados.'}
            </p>
            <LitTextRenderer answer={content} options={rendererOptions} />
            <div className={styles.actions}>
              <button
                className={styles.primary}
                disabled={applying || (preview === 'note' && readonly)}
                type="button"
                onClick={() => {
                  apply(false).catch(() =>
                    onStatus('Falha ao aplicar resposta.')
                  );
                }}
              >
                {applying
                  ? 'Aplicando…'
                  : preview === 'page'
                    ? 'Confirmar criação da página'
                    : 'Acrescentar ao final'}
              </button>
              {preview === 'note' && (
                <button
                  className={styles.button}
                  disabled={applying || readonly}
                  type="button"
                  onClick={() => {
                    apply(true).catch(() =>
                      onStatus('Falha ao aplicar resposta.')
                    );
                  }}
                >
                  Substituir texto da nota
                </button>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
