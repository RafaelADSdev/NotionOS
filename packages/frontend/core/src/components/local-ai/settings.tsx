import {
  SettingHeader,
  SettingWrapper,
} from '@affine/component/setting-components';
import { useEffect, useRef, useState } from 'react';

import { completeChat } from '../../modules/local-ai/client';
import {
  forgetLocalAIKey,
  isKeyRememberedInTab,
  saveLocalAIConfig,
  useLocalAIConfig,
} from '../../modules/local-ai/config';
import * as styles from './styles.css';

export function LocalAISettings() {
  const saved = useLocalAIConfig();
  const [config, setConfig] = useState(saved);
  const [remember, setRemember] = useState(isKeyRememberedInTab);
  const [status, setStatus] = useState('');
  const [testing, setTesting] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  const save = () => {
    try {
      saveLocalAIConfig(config, remember);
      setStatus('Configuração salva. Você já pode abrir o Chat com IA.');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a configuração.'
      );
    }
  };

  const test = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    setTesting(true);
    setStatus('Testando conexão…');
    try {
      await completeChat(
        config,
        [{ role: 'user', content: 'Responda apenas OK.' }],
        controller.signal
      );
      setStatus('Conexão confirmada. Salve para usar esta configuração.');
    } catch (error) {
      setStatus(
        controller.signal.aborted
          ? 'Teste cancelado ou tempo de espera excedido.'
          : error instanceof Error
            ? error.message
            : 'Falha ao testar conexão.'
      );
    } finally {
      clearTimeout(timeout);
      request.current = null;
      setTesting(false);
    }
  };

  return (
    <>
      <SettingHeader
        title="Inteligência artificial"
        subtitle="Use sua chave de API, sem assinatura do AFFiNE."
      />
      <SettingWrapper title="Provedor e modelo">
        <div className={styles.settings}>
          <p className={styles.muted}>
            Use Claude pela API da Anthropic ou OpenAI e serviços compatíveis. O
            uso pode ser cobrado pelo provedor.
          </p>
          <form
            className={styles.form}
            onSubmit={event => {
              event.preventDefault();
              save();
            }}
          >
            <label className={styles.field}>
              Provedor
              <select
                aria-label="Provedor"
                className={styles.control}
                disabled={testing}
                value={config.provider ?? 'openai'}
                onChange={event => {
                  const provider =
                    event.target.value === 'anthropic' ? 'anthropic' : 'openai';
                  setConfig({
                    provider,
                    baseUrl:
                      provider === 'anthropic'
                        ? 'https://api.anthropic.com/v1'
                        : 'https://api.openai.com/v1',
                    model: '',
                    apiKey: '',
                  });
                  setRemember(false);
                  setStatus(
                    'Informe o modelo e a chave do provedor selecionado.'
                  );
                }}
              >
                <option value="openai">OpenAI / API compatível</option>
                <option value="anthropic">Claude (Anthropic)</option>
              </select>
            </label>
            <label className={styles.field}>
              URL base da API
              <input
                className={styles.control}
                type="url"
                required
                value={config.baseUrl}
                spellCheck={false}
                onChange={event =>
                  setConfig({ ...config, baseUrl: event.target.value })
                }
              />
            </label>
            <label className={styles.field}>
              Modelo
              <input
                className={styles.control}
                required
                placeholder="Identificador do modelo na sua conta"
                value={config.model}
                spellCheck={false}
                onChange={event =>
                  setConfig({ ...config, model: event.target.value })
                }
              />
            </label>
            <label className={styles.field}>
              Chave de API
              <input
                className={styles.control}
                type="password"
                required
                autoComplete="off"
                spellCheck={false}
                value={config.apiKey}
                onChange={event =>
                  setConfig({ ...config, apiKey: event.target.value })
                }
              />
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={remember}
                onChange={event => setRemember(event.target.checked)}
              />{' '}
              Lembrar nesta aba
            </label>
            {config.provider === 'anthropic' && (
              <label className={styles.field}>
                ID do workspace Anthropic (opcional)
                <input
                  className={styles.control}
                  value={config.workspaceId ?? ''}
                  spellCheck={false}
                  placeholder="Somente se sua chave exigir um workspace"
                  onChange={event =>
                    setConfig({ ...config, workspaceId: event.target.value })
                  }
                />
              </label>
            )}
            <p className={styles.muted}>
              A chave fica apenas na memória por padrão. Ao lembrar nesta aba,
              ela fica no armazenamento de sessão do navegador, sem
              criptografia. Use somente em um navegador de confiança. A chave
              será enviada à URL configurada.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="submit"
                disabled={testing}
              >
                Salvar configuração
              </button>
              <button
                className={styles.button}
                type="button"
                disabled={testing}
                onClick={() => {
                  test().catch(() =>
                    setStatus('Não foi possível testar a conexão.')
                  );
                }}
              >
                Testar conexão
              </button>
              <button
                className={styles.button}
                type="button"
                disabled={testing}
                onClick={() => {
                  forgetLocalAIKey();
                  setConfig({ ...config, apiKey: '' });
                  setRemember(false);
                  setStatus('Chave removida.');
                }}
              >
                Remover chave
              </button>
              {testing && (
                <button
                  className={styles.button}
                  type="button"
                  onClick={() => request.current?.abort()}
                >
                  Cancelar teste
                </button>
              )}
            </div>
          </form>
          <p className={styles.muted}>
            Testar conexão envia uma mensagem curta à API e pode consumir
            créditos. As notas só são enviadas quando você inclui seu texto no
            assistente.
          </p>
          <p className={styles.status} role="status">
            {status}
          </p>
        </div>
      </SettingWrapper>
    </>
  );
}
