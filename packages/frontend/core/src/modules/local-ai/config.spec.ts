import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

describe('personal API key storage', () => {
  it('persists the Claude protocol and workspace without persisting its secret', async () => {
    const claude = {
      provider: 'anthropic' as const,
      workspaceId: 'wrkspc_test',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'test-claude',
      apiKey: 'fake-claude-key',
    };
    let storage = await import('./config');
    storage.saveLocalAIConfig(claude, true);
    expect(localStorage.getItem('nexo-ai-preferences')).not.toContain(
      claude.apiKey
    );
    vi.resetModules();
    storage = await import('./config');
    expect(storage.getLocalAIConfig()).toEqual(claude);
  });
  const config = {
    apiKey: 'fake-secret',
    model: 'test-model',
    baseUrl: 'https://api.openai.com/v1',
  };

  it('keeps credentials out of persistent storage and forgets in-memory keys on reload', async () => {
    let storage = await import('./config');
    storage.saveLocalAIConfig(config, false);
    expect(storage.getLocalAIConfig().apiKey).toBe('fake-secret');
    expect(localStorage.getItem('nexo-ai-preferences')).not.toContain(
      'fake-secret'
    );
    expect(sessionStorage.getItem('nexo-ai-session-key')).toBeNull();
    vi.resetModules();
    storage = await import('./config');
    expect(storage.getLocalAIConfig()).toEqual({ ...config, apiKey: '' });
  });

  it('restores opt-in tab keys and removes them when requested', async () => {
    let storage = await import('./config');
    storage.saveLocalAIConfig(config, true);
    vi.resetModules();
    storage = await import('./config');
    expect(storage.getLocalAIConfig()).toEqual(config);
    storage.forgetLocalAIKey();
    expect(storage.getLocalAIConfig().apiKey).toBe('');
    expect(sessionStorage.getItem('nexo-ai-session-key')).toBeNull();
  });

  it('ignores credentials in persistent preferences from older or modified data', async () => {
    localStorage.setItem('nexo-ai-preferences', JSON.stringify(config));
    const storage = await import('./config');
    expect(storage.getLocalAIConfig().apiKey).toBe('');
  });
});
