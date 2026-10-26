import { useSyncExternalStore } from 'react';

import { type LocalAIConfig, validateConfig } from './client';

const preferencesKey = 'nexo-ai-preferences';
const sessionKey = 'nexo-ai-session-key';
const defaults: LocalAIConfig = {
  baseUrl: 'https://api.openai.com/v1',
  model: '',
  apiKey: '',
};
let snapshot: LocalAIConfig | undefined;
const listeners = new Set<() => void>();

export function getLocalAIConfig(): LocalAIConfig {
  if (snapshot) return snapshot;
  let preferences: Partial<LocalAIConfig> = {};
  let apiKey = '';
  try {
    const stored = JSON.parse(localStorage.getItem(preferencesKey) ?? '{}');
    // Never restore credentials from persistent preferences.
    preferences = {
      ...(stored?.provider === 'anthropic' || stored?.provider === 'openai'
        ? { provider: stored.provider }
        : {}),
      ...(typeof stored?.workspaceId === 'string'
        ? { workspaceId: stored.workspaceId }
        : {}),
      baseUrl:
        typeof stored?.baseUrl === 'string' ? stored.baseUrl : defaults.baseUrl,
      model: typeof stored?.model === 'string' ? stored.model : '',
    };
    apiKey = sessionStorage.getItem(sessionKey) ?? '';
  } catch {
    // Private browser profiles may disable storage; in-memory use still works.
  }
  snapshot = { ...defaults, ...preferences, apiKey };
  return snapshot;
}

export function saveLocalAIConfig(
  config: LocalAIConfig,
  rememberInTab: boolean
) {
  const baseUrl = validateConfig(config);
  const next = {
    ...(config.provider ? { provider: config.provider } : {}),
    ...(config.workspaceId?.trim()
      ? { workspaceId: config.workspaceId.trim() }
      : {}),
    baseUrl,
    model: config.model.trim(),
    apiKey: config.apiKey.trim(),
  };
  // If storage is unavailable, report it before changing the active configuration.
  if (rememberInTab) sessionStorage.setItem(sessionKey, next.apiKey);
  else {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      /* Storage can be disabled. */
    }
  }
  try {
    localStorage.setItem(
      preferencesKey,
      JSON.stringify({ ...next, apiKey: undefined })
    );
  } catch {
    /* Configuration remains usable in memory. */
  }
  snapshot = next;
  listeners.forEach(listener => listener());
}

export function forgetLocalAIKey() {
  try {
    sessionStorage.removeItem(sessionKey);
  } catch {
    /* Storage can be disabled. */
  }
  snapshot = { ...getLocalAIConfig(), apiKey: '' };
  listeners.forEach(listener => listener());
}

export function isKeyRememberedInTab() {
  try {
    return !!sessionStorage.getItem(sessionKey);
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLocalAIConfig() {
  return useSyncExternalStore(subscribe, getLocalAIConfig, () => defaults);
}
