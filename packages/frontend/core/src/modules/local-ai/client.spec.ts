import { afterEach, describe, expect, it, vi } from 'vitest';

import { completeChat, validateConfig } from './client';

const config = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'test-model',
  apiKey: 'test-key-do-not-use',
};

afterEach(() => vi.unstubAllGlobals());

describe('local AI provider boundary', () => {
  it('enables Claude web search only on request and includes safe source links', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        content: [
          {
            type: 'text',
            text: 'Resultado atual.',
            citations: [
              { url: 'https://example.com/source', title: 'Fonte' },
              { url: 'javascript:alert(1)', title: 'Unsafe' },
            ],
          },
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const reply = await completeChat(
      {
        ...config,
        provider: 'anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
      },
      [{ role: 'user', content: 'Pesquise.' }],
      new AbortController().signal,
      { webSearch: true }
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).tools).toEqual([
      { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
    ]);
    expect(reply).toContain('[Fonte](<https://example.com/source>)');
    expect(reply).not.toContain('javascript:');
  });

  it('uses OpenAI Responses for web research without storing the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: 'Pesquisa concluída.',
                annotations: [
                  {
                    type: 'url_citation',
                    url: 'https://example.com/article',
                    title: 'Artigo',
                  },
                ],
              },
            ],
          },
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(
      await completeChat(
        config,
        [{ role: 'user', content: 'Pesquise.' }],
        new AbortController().signal,
        { webSearch: true }
      )
    ).toContain('https://example.com/article');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.openai.com/v1/responses'
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      store: false,
      tools: [{ type: 'web_search' }],
    });
  });

  it('does not silently fall back to model memory for unsupported or failed search', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      completeChat(
        { ...config, baseUrl: 'https://example.com/v1' },
        [],
        new AbortController().signal,
        { webSearch: true }
      )
    ).rejects.toThrow(/busca/);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockResolvedValue(
      Response.json({
        content: [
          {
            type: 'web_search_tool_result',
            content: { type: 'web_search_tool_result_error' },
          },
          { type: 'text', text: 'Guess' },
        ],
      })
    );
    await expect(
      completeChat(
        { ...config, provider: 'anthropic' },
        [],
        new AbortController().signal,
        { webSearch: true }
      )
    ).rejects.toThrow(/pesquisa/);
  });
  it('uses native Claude messages, system prompt and browser headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        content: [
          { type: 'thinking', thinking: 'internal' },
          { type: 'text', text: 'Olá' },
          { type: 'text', text: 'Claude' },
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await expect(
      completeChat(
        {
          ...config,
          provider: 'anthropic',
          baseUrl: 'https://api.anthropic.com/v1',
          workspaceId: 'wrkspc_test',
        },
        [
          { role: 'system', content: 'Ajude com a nota.' },
          { role: 'user', content: 'Olá' },
          { role: 'assistant', content: 'Posso ajudar?' },
          { role: 'user', content: 'Resuma.' },
        ],
        signal
      )
    ).resolves.toBe('Olá\n\nClaude');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe(config.apiKey);
    expect(options.headers['anthropic-version']).toBe('2026-10-21');
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe(
      'true'
    );
    expect(options.headers['anthropic-workspace-id']).toBe('wrkspc_test');
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.credentials).toBe('omit');
    expect(options.signal).toBe(signal);
    expect(JSON.parse(options.body)).toEqual({
      model: 'test-model',
      max_tokens: 4096,
      stream: false,
      system: 'Ajude com a nota.',
      messages: [
        { role: 'user', content: 'Olá' },
        { role: 'assistant', content: 'Posso ajudar?' },
        { role: 'user', content: 'Resuma.' },
      ],
    });
  });

  it('rejects a Claude response without text instead of exposing thinking or tool output', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          content: [{ type: 'thinking', thinking: 'private' }],
        })
      )
    );
    await expect(
      completeChat(
        { ...config, provider: 'anthropic' },
        [],
        new AbortController().signal
      )
    ).rejects.toThrow(/texto/);
  });
  it('rejects insecure remote endpoints and embedded credentials', () => {
    expect(() =>
      validateConfig({ ...config, baseUrl: 'http://example.com' })
    ).toThrow();
    expect(() =>
      validateConfig({ ...config, baseUrl: 'https://user:pass@example.com' })
    ).toThrow();
    expect(() =>
      validateConfig({ ...config, baseUrl: 'https://example.com?key=secret' })
    ).toThrow();
    expect(() => validateConfig({ ...config, apiKey: '' })).toThrow();
    expect(() =>
      validateConfig({ ...config, baseUrl: 'http://localhost:11434/v1' })
    ).not.toThrow();
  });

  it('sends the user key only to the configured provider without cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: 'Resposta de teste' } }],
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    await expect(
      completeChat(
        config,
        [{ role: 'user', content: 'Olá' }],
        controller.signal
      )
    ).resolves.toBe('Resposta de teste');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(options.headers.Authorization).toBe('Bearer test-key-do-not-use');
    expect(options.credentials).toBe('omit');
    expect(options.redirect).toBe('error');
    expect(options.signal).toBe(controller.signal);
    expect(JSON.parse(options.body)).toEqual({
      model: 'test-model',
      messages: [{ role: 'user', content: 'Olá' }],
      stream: false,
    });
  });

  it.each([401, 403, 429, 500])(
    'handles provider error %s without reflecting secrets',
    async status => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(new Response('test-key-do-not-use', { status }))
      );
      await expect(
        completeChat(config, [], new AbortController().signal)
      ).rejects.toThrow(/chave|permissão|limite|provedor/i);
      await expect(
        completeChat(config, [], new AbortController().signal)
      ).rejects.not.toThrow('test-key-do-not-use');
    }
  );

  it('rejects empty responses and surfaces browser network restrictions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ choices: [] }))
    );
    await expect(
      completeChat(config, [], new AbortController().signal)
    ).rejects.toThrow(/texto/i);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );
    await expect(
      completeChat(config, [], new AbortController().signal)
    ).rejects.toThrow(/CORS/);
  });

  it('does not convert cancellation into a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    );
    await expect(
      completeChat(config, [], new AbortController().signal)
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
