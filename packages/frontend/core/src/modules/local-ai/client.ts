export interface LocalAIConfig {
  provider?: 'openai' | 'anthropic';
  workspaceId?: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface LocalAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function supportsWebSearch(config: LocalAIConfig) {
  return (
    config.provider === 'anthropic' ||
    config.baseUrl.trim().replace(/\/+$/, '') === 'https://api.openai.com/v1'
  );
}

function sourceLinks(citations: { url?: unknown; title?: unknown }[]) {
  const sources = new Map<string, string>();
  for (const citation of citations) {
    if (typeof citation.url !== 'string') continue;
    try {
      const url = new URL(citation.url);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        continue;
      const title =
        typeof citation.title === 'string'
          ? citation.title.replace(/[[\]\n\r]/g, '')
          : url.hostname;
      sources.set(url.href, title);
    } catch {
      /* Ignore invalid provider citations. */
    }
  }
  return sources.size
    ? '\n\n### Fontes\n' +
        [...sources].map(([url, title]) => `- [${title}](<${url}>)`).join('\n')
    : '';
}

export function validateConfig(config: LocalAIConfig) {
  if (!config.apiKey.trim())
    throw new Error('Informe sua chave de API nas configurações de IA.');
  if (!config.model.trim())
    throw new Error('Informe o modelo nas configurações de IA.');
  let url: URL;
  try {
    url = new URL(config.baseUrl.trim());
  } catch {
    throw new Error('Informe um endereço de API válido.');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'Use uma URL HTTPS sem credenciais, parâmetros ou fragmentos. HTTP é permitido apenas em localhost.'
    );
  }
  return url.href.replace(/\/+$/, '');
}

/** A direct, stateless request: no AFFiNE login, cookies, proxy or subscription. */
export async function completeChat(
  config: LocalAIConfig,
  messages: LocalAIMessage[],
  signal: AbortSignal,
  options: { webSearch?: boolean } = {}
): Promise<string> {
  const baseUrl = validateConfig(config);
  const anthropic = config.provider === 'anthropic';
  if (options.webSearch && !supportsWebSearch(config))
    throw new Error(
      'A busca na web requer Claude/Anthropic ou a API oficial da OpenAI. Desative a busca para usar este provedor.'
    );
  const responses = options.webSearch && !anthropic;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (anthropic) {
    headers['x-api-key'] = config.apiKey.trim();
    headers['anthropic-version'] = '2026-10-21';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    if (config.workspaceId?.trim())
      headers['anthropic-workspace-id'] = config.workspaceId.trim();
  } else {
    headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  }
  const body = responses
    ? {
        model: config.model.trim(),
        input: messages,
        store: false,
        tools: [{ type: 'web_search' }],
      }
    : anthropic
      ? {
          model: config.model.trim(),
          max_tokens: 4096,
          ...(options.webSearch
            ? {
                tools: [
                  {
                    type: 'web_search_20250305',
                    name: 'web_search',
                    max_uses: 3,
                  },
                ],
              }
            : {}),
          stream: false,
          system: messages
            .filter(message => message.role === 'system')
            .map(message => message.content)
            .join('\n\n'),
          messages: messages
            .filter(message => message.role !== 'system')
            .map(({ role, content }) => ({ role, content })),
        }
      : { model: config.model.trim(), messages, stream: false };
  let response: Response;
  try {
    response = await fetch(
      `${baseUrl}/${responses ? 'responses' : anthropic ? 'messages' : 'chat/completions'}`,
      {
        method: 'POST',
        headers,
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        signal,
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    )
      throw error;
    throw new Error(
      'Não foi possível acessar a API. Verifique a conexão, a URL e se o provedor permite chamadas do navegador (CORS).'
    );
  }
  if (!response.ok) {
    // Provider bodies may echo credentials or submitted document text.
    const message =
      response.status === 401
        ? 'Chave de API inválida ou expirada.'
        : response.status === 403
          ? 'A chave não tem permissão para usar este modelo.'
          : response.status === 429
            ? 'O provedor atingiu um limite de uso ou saldo. Verifique sua conta.'
            : response.status === 404
              ? 'Modelo ou endereço da API não encontrado. Confira as configurações.'
              : `O provedor não concluiu a solicitação (HTTP ${response.status}).`;
    throw new Error(message);
  }
  let result: {
    choices?: { message?: { content?: unknown; refusal?: unknown } }[];
    content?: {
      type?: string;
      text?: unknown;
      citations?: { url?: unknown; title?: unknown }[];
      content?: { type?: string };
    }[];
    output?: {
      type?: string;
      content?: {
        type?: string;
        text?: unknown;
        annotations?: { url?: unknown; title?: unknown }[];
      }[];
    }[];
    stop_reason?: string;
  };
  try {
    result = await response.json();
  } catch {
    throw new Error(
      'O provedor retornou uma resposta inválida. Confira a URL da API.'
    );
  }
  if (responses) {
    const blocks = Array.isArray(result?.output)
      ? result.output
          .filter(item => item?.type === 'message')
          .flatMap(item => (Array.isArray(item.content) ? item.content : []))
      : [];
    const text = blocks
      .filter(
        block => block?.type === 'output_text' && typeof block.text === 'string'
      )
      .map(block => block.text as string)
      .join('\n\n');
    if (!text.trim())
      throw new Error(
        'O provedor não retornou texto da pesquisa. Confira se o modelo suporta busca na web.'
      );
    return (
      text +
      sourceLinks(
        blocks.flatMap(block =>
          Array.isArray(block?.annotations) ? block.annotations : []
        )
      )
    );
  }
  if (anthropic) {
    if (
      options.webSearch &&
      (result.stop_reason === 'pause_turn' ||
        (Array.isArray(result.content) &&
          result.content.some(
            block => block?.content?.type === 'web_search_tool_result_error'
          )))
    )
      throw new Error(
        'A pesquisa na web não foi concluída. Verifique a disponibilidade da ferramenta no provedor e tente novamente.'
      );
    const text = Array.isArray(result?.content)
      ? result.content
          .filter(
            block => block?.type === 'text' && typeof block.text === 'string'
          )
          .map(block => block.text as string)
          .join('\n\n')
      : '';
    if (!text.trim())
      throw new Error(
        'O provedor não retornou texto. Confira se o modelo aceita chat de texto.'
      );
    return (
      text +
      sourceLinks(
        Array.isArray(result.content)
          ? result.content.flatMap(block =>
              Array.isArray(block?.citations) ? block.citations : []
            )
          : []
      )
    );
  }
  const message = result?.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(
      message?.refusal
        ? 'O provedor recusou esta solicitação.'
        : 'O provedor não retornou texto. Confira se o modelo aceita chat de texto.'
    );
  }
  return content;
}
