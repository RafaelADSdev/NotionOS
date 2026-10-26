import { readdirSync, readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const upstreamLinks =
  'a[href*="affine.pro"], a[href*="toeverything"], a[href*="AffineOfficial"], a[href*="affine.vip"], a[href*="affine.fail"]';

test('local product identity is consistent across all language catalogs', () => {
  const resourceDir = new URL(
    '../../../packages/frontend/i18n/src/resources/',
    import.meta.url
  );
  // These are descriptions of the original provider's services, whose routes are disabled.
  const serviceAttribution =
    /^com\.affine\.(auth\.(open\.affine|sign\.message)|open-in-app\.|payment\.license-success\.)/;
  const violations: string[] = [];
  for (const name of readdirSync(resourceDir).filter(name =>
    name.endsWith('.json')
  )) {
    const catalog = JSON.parse(
      readFileSync(new URL(name, resourceDir), 'utf8')
    ) as Record<string, string>;
    for (const [key, value] of Object.entries(catalog)) {
      if (serviceAttribution.test(key)) continue;
      if (/AFFiNE|AFFINE|AffiNE/.test(value))
        violations.push(`${name}: ${key}`);
    }
  }
  expect(violations).toEqual([]);
});

test('local import and error screens do not advertise upstream services', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('slider-bar-import-button').click();
  await expect(page.getByTestId('import-modal')).toBeVisible();
  await expect(page.locator(upstreamLinks)).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.goto('/404');
  await expect(page.getByTestId('not-found')).toBeVisible();
  await expect(
    page.getByTestId('not-found').getByRole('img', { name: 'Nexo' })
  ).toBeVisible();
  await expect(page.locator(upstreamLinks)).toHaveCount(0);
  await expect(page.getByText(/Download App|Baixar aplicativo/i)).toHaveCount(
    0
  );
  await page.goto('/workspace/missing-local-workspace/missing-document');
  await expect(page.getByTestId('not-found')).toBeVisible();
  await expect(page.getByTestId('continue-login-button')).toHaveCount(0);
  await expect(page.locator(upstreamLinks)).toHaveCount(0);
});

test('legacy cloud and desktop routes return to the local workspace without contacting upstream', async ({
  page,
}) => {
  test.setTimeout(90000);
  const requests: string[] = [];
  page.on('request', request => {
    const hostname = new URL(request.url()).hostname;
    if (
      /(^|\.)(affine\.(pro|fail|vip)|toeverything\.(info|workers\.dev))$/i.test(
        hostname
      ) ||
      /\/(graphql|api\/auth)(\/|\?|$)/.test(request.url())
    ) {
      requests.push(request.url());
    }
  });
  await page.goto('/');
  await expect(page.getByTestId('current-workspace-card')).toBeVisible();
  for (const route of [
    '/sign-in',
    '/subscribe',
    '/try-cloud',
    '/upgrade-success',
    '/ai-upgrade-success',
    '/upgrade-to-team',
    '/open-app/url?url=affine%3A%2F%2Fworkspace%2Ftest',
    '/onboarding',
    '/invite/test',
    '/oauth/login',
    '/auth/signin',
    '/clipper/import',
    '/template/import',
    '/?initCloud=true',
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/workspace\//);
    await expect(page.getByTestId('current-workspace-card')).toBeVisible();
    await expect(page.locator(upstreamLinks)).toHaveCount(0);
  }
  expect(requests).toEqual([]);
});

test('settings contain no upstream promotion and PDF export uses bundled fonts', async ({
  page,
}) => {
  test.setTimeout(90000);
  const upstreamRequests: string[] = [];
  const fontRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (
      url.hostname.includes('affine.') ||
      url.hostname.includes('toeverything.')
    )
      upstreamRequests.push(url.href);
    if (url.pathname.includes('/fonts/')) fontRequests.push(url.pathname);
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      'global-state:affine-flag:enable_pdfmake_export',
      'true'
    );
  });
  await page.goto('/');
  await page.getByTestId('slider-bar-workspace-setting-button').click();
  for (const tab of [
    'about-panel-trigger',
    'appearance-panel-trigger',
    'shortcuts-panel-trigger',
    'editor-panel-trigger',
    'experimental-features-trigger',
  ]) {
    await page.getByTestId(tab).click();
    if (await page.getByTestId('experimental-prompt').count()) {
      await page.getByTestId('experimental-prompt-disclaimer').click();
      await page.getByTestId('experimental-confirm-button').click();
    }
    await expect(page.locator(upstreamLinks)).toHaveCount(0);
    await expect(
      page.getByText(
        /Gosta do nosso aplicativo|Love our app|Discussion about this feature/
      )
    ).toHaveCount(0);
  }
  await page.getByTestId('modal-close-button').click();
  await page.getByTestId('sidebar-new-page-button').click();
  await page.locator('.inline-editor').first().click();
  await page.keyboard.insertText('Nexo PDF');
  await page.locator('.inline-editor').last().click();
  await page.keyboard.insertText('Ação, ideias e conhecimento.');
  await page.getByTestId('header-dropDownButton').click();
  await page.getByTestId('export-menu').hover();
  const downloadReady = page.waitForEvent('download', { timeout: 45000 });
  await page.getByTestId('export-to-pdf-export').click();
  const download = await downloadReady;
  const outputPath = await download.path();
  expect(outputPath).toBeTruthy();
  expect(readFileSync(outputPath!).subarray(0, 4).toString()).toBe('%PDF');
  expect(
    fontRequests.some(path => path.endsWith('/SarasaGothicCL-Regular.ttf'))
  ).toBe(true);
  expect(upstreamRequests).toEqual([]);
});
