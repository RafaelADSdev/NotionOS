import { expect, test } from '@playwright/test';

test('local notes and whiteboards work with optional BYOK AI and without accounts or server requests', async ({
  page,
}) => {
  const serverRequests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {
    if (
      /\/(api\/(auth|telemetry)|graphql|socket\.io)(\/|\?|$)/.test(
        request.url()
      )
    ) {
      serverRequests.push(request.url());
    }
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.addInitScript(() => {
    // An old upstream flag must not enable the cloud AI transport.
    localStorage.setItem('global-state:affine-flag:enable_ai', 'true');
  });
  await page.goto('/');
  await expect(page.getByTestId('current-workspace-card')).toBeVisible();
  await expect(page).toHaveTitle('Primeiros passos no Nexo · Nexo');
  await expect(page.locator('a[href*="affine.pro"]')).toHaveCount(0);
  await expect(page.getByTestId('ai-chat')).toBeVisible();
  await expect(page.getByTestId('ai-island')).toHaveCount(0);
  await expect(page.getByTestId('local-demo-tips')).toHaveCount(0);
  await expect(page.getByTestId('right-bottom-change-log-icon')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Compartilhar|Share/ })
  ).toHaveCount(0);

  await page.getByTestId('current-workspace-card').click();
  await expect(page.getByTestId('new-workspace')).toBeVisible();
  await expect(page.getByTestId('cloud-signin-button')).toHaveCount(0);
  await expect(page.getByText(/Adicionar servidor|Add server/i)).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.getByTestId('sidebar-new-page-button').click();
  await page.locator('.inline-editor').first().click();
  await page.keyboard.insertText('Nexo local');
  await page.locator('.inline-editor').last().click();
  await page.keyboard.insertText('Uma nota salva sem nuvem.');
  await page.reload();
  await expect(
    page.getByText('Uma nota salva sem nuvem.', { exact: true })
  ).toBeVisible();
  await expect(page).toHaveTitle('Nexo local · Nexo');
  await page.getByRole('radio').nth(1).click();
  await expect(page.locator('affine-edgeless-root')).toBeVisible();
  await page.getByRole('radio').first().click();

  await page.getByTestId('slider-bar-workspace-setting-button').click();
  await expect(page.getByTestId('settings-sidebar')).toBeVisible();
  await expect(page.getByTestId('plans-panel-trigger')).toHaveCount(0);
  await expect(page.getByTestId('workspace-setting:members')).toHaveCount(0);
  await expect(page.getByTestId('workspace-setting:embedding')).toHaveCount(0);
  await page.getByTestId('workspace-setting:preference').click();
  await expect(
    page.getByTestId('publish-enable-affine-cloud-button')
  ).toHaveCount(0);
  await expect(page.getByTestId('reset-sync-status')).toHaveCount(0);
  await page.getByTestId('editor-panel-trigger').click();
  await expect(
    page.getByText(/Nexo AI|Nexo IA|Habilitar IA|Enable AI/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(/Entrar na conta|Entrar no Nexo|Sign in to Nexo/i)
  ).toHaveCount(0);
  await page.getByTestId('about-panel-trigger').click();
  await expect(page.getByTestId('about-title')).toContainText('Nexo');
  await expect(page.getByText('GitHub', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Discord', { exact: true })).toHaveCount(0);
  await expect(
    page.locator(
      'a[href*="affine.pro"], a[href*="toeverything"], a[href*="AffineOfficial"], a[href*="reddit.com/r/Affine"]'
    )
  ).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByTestId('sidebar-template-doc-entrance').click();
  await expect(page.getByTestId('template-doc-item-create')).toBeVisible();
  await expect(page.locator('a[href*="affine.pro"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  const chatUrl = new URL(page.url());
  const workspacePath = chatUrl.pathname.replace(/\/[^/]+$/, '');
  chatUrl.pathname = `${workspacePath}/chat`;
  await page.goto(chatUrl.href);
  await expect(
    page.getByRole('region', { name: 'Assistente de IA do Nexo' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enviar', exact: true })
  ).toBeDisabled();
  await expect(page.getByTestId('ai-island')).toHaveCount(0);
  expect(serverRequests).toEqual([]);
  expect(errors).toEqual([]);
});
