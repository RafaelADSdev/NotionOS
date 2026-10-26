import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const readJson = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as Record<
    string,
    string
  >;

test('Portuguese covers the entire catalog and preserves message variables', () => {
  const english = readJson(
    '../../../packages/frontend/i18n/src/resources/en.json'
  );
  const portuguese = readJson(
    '../../../packages/frontend/i18n/src/resources/pt-BR.json'
  );
  const tokens = (text: string) =>
    [...text.matchAll(/{{\s*([^}]+?)\s*}}/g)].map(match => match[1]).sort();
  const tags = (text: string) =>
    [...text.matchAll(/<\/?\d+>/g)].map(match => match[0]).sort();
  for (const [key, value] of Object.entries(english)) {
    expect(portuguese[key]?.trim(), key).toBeTruthy();
    expect(tokens(portuguese[key]), key).toEqual(tokens(value));
    expect(tags(portuguese[key]), key).toEqual(tags(value));
  }
  const coverage = readJson(
    '../../../packages/frontend/i18n/src/i18n-completenesses.json'
  );
  expect(coverage['pt-BR']).toBe(100);
});

test('light and dark persist and appearance settings display complete Portuguese', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Primeiros passos no Nexo · Nexo');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  for (const theme of ['light', 'dark']) {
    await page.getByTestId(`nexo-${theme}-theme`).click();
    await expect(page.getByTestId(`nexo-${theme}-theme`)).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.reload();
    await expect(page.getByTestId(`nexo-${theme}-theme`)).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  }

  await page.getByTestId('slider-bar-workspace-setting-button').click();
  await page.getByText('Aparência', { exact: true }).click();
  await expect(page.getByText('Imagens', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Suavizar a exibição de imagens', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('Espaço de trabalho', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('Smooth image rendering', { exact: true })
  ).toHaveCount(0);
  await page.getByTestId('language-menu-button').click();
  await expect(page.locator('[role="menuitem"][lang="pt-BR"]')).toContainText(
    '100%'
  );
  await page.keyboard.press('Escape');
  await page.getByTestId('light-theme-trigger').click();
  await page.getByTestId('modal-close-button').click();
  await expect(page.getByTestId('settings-sidebar')).toHaveCount(0);
  await expect(page.getByTestId('nexo-light-theme')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(
    page.getByText('Vínculos bidirecionais', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('Bi-Directional Links', { exact: true })
  ).toHaveCount(0);
  await page.getByTestId('sidebar-new-page-button').click();
  await page.locator('.inline-editor').last().click();
  await page.keyboard.type('/');
  const textCommand = page.locator('inner-slash-menu icon-button[text="Text"]');
  await expect(textCommand.locator('.text')).toHaveText('Texto');
  await expect(
    textCommand.getByText('Comece a escrever um texto simples.', {
      exact: true,
    })
  ).toBeVisible();
  await page.keyboard.type('amanha');
  const tomorrow = page.locator(
    'inner-slash-menu icon-button[text="Tomorrow"]'
  );
  await expect(tomorrow.locator('.text')).toHaveText('Amanhã');
  await page.keyboard.press('Enter');
  await expect(page.locator('inner-slash-menu')).toHaveCount(0);
  expect(errors).toEqual([]);
});
