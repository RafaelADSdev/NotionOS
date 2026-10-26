import { expect, type Page, test } from '@playwright/test';

async function configure(page: Page) {
  await page
    .getByRole('button', { name: 'Configurar IA', exact: true })
    .click();
  await page.getByLabel('Modelo', { exact: true }).fill('test-model');
  await page.getByLabel('Chave de API', { exact: true }).fill('fake-test-key');
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await page.getByTestId('modal-close-button').click();
}

test('reference layout stays centered in desktop and narrow containers', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('ai-chat').click();
  await expect(
    page.getByRole('heading', { name: 'Como posso ajudar?' })
  ).toBeVisible();
  await page.getByTestId('nexo-light-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const prompt = page.getByLabel('Mensagem', { exact: true });
  await expect(prompt).toBeVisible();
  const box = await prompt.boundingBox();
  expect(box!.width).toBeGreaterThan(650);
  await page.screenshot({
    path: '.codex/local-ai-empty-light.png',
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 430, height: 900 });
  const panel = page.getByRole('region', { name: 'Assistente de IA do Nexo' });
  await expect
    .poll(() =>
      panel.evaluate(element => element.getBoundingClientRect().width)
    )
    .toBeGreaterThan(400);
  await expect(prompt).toBeVisible();
  expect(
    await panel.evaluate(element => element.scrollWidth <= element.clientWidth)
  ).toBe(true);
  await page.screenshot({
    path: '.codex/local-ai-empty-narrow.png',
    animations: 'disabled',
  });
});

test('web research uses real provider tool request and displays citations', async ({
  page,
}) => {
  let request: Record<string, unknown> | undefined;
  await page.route('https://api.openai.com/v1/responses', async route => {
    request = route.request().postDataJSON();
    await route.fulfill({
      json: {
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: 'Resultado da pesquisa.',
                annotations: [
                  {
                    type: 'url_citation',
                    title: 'Fonte oficial',
                    url: 'https://example.com/reference',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
  await page.goto('/');
  await page.getByTestId('ai-chat').click();
  await configure(page);
  await page.getByLabel('Adicionar contexto', { exact: true }).click();
  await page.getByLabel('Pesquisar na web', { exact: true }).check();
  await page.getByLabel('Adicionar contexto', { exact: true }).click();
  await page
    .getByLabel('Mensagem', { exact: true })
    .fill('Pesquise informações atuais.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Fonte oficial' })
  ).toHaveAttribute('href', 'https://example.com/reference');
  expect(request).toMatchObject({
    tools: [{ type: 'web_search' }],
    store: false,
  });
});

test('text context, rich page creation, history and sandboxed HTML apps work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let mode: 'table' | 'html' = 'table';
  let submitted = '';
  await page.route(
    'https://api.openai.com/v1/chat/completions',
    async route => {
      submitted = route.request().postData() ?? '';
      const content =
        mode === 'table'
          ? '# Plano novo\n\n| Tarefa | Estado |\n| --- | --- |\n| Revisar | Aberta |'
          : "```html\n<!doctype html><html><body><h1>Meu aplicativo</h1><button onclick=\"document.querySelector('h1').textContent='Funcionou'\">Testar</button></body></html>\n```";
      await route.fulfill({ json: { choices: [{ message: { content } }] } });
    }
  );
  await page.goto('/');
  await page.getByTestId('ai-chat').click();
  await configure(page);
  await page.getByLabel('Arquivo de contexto', { exact: true }).setInputFiles({
    name: 'contexto.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('Contexto de projeto escolhido pelo usuário.'),
  });
  await page
    .getByLabel('Mensagem', { exact: true })
    .fill('Crie uma tabela para este projeto.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByTestId('ai-text-renderer').locator('affine-table')
  ).toBeVisible();
  expect(submitted).toContain('Contexto de projeto escolhido pelo usuário.');
  await page
    .getByRole('button', { name: 'Fixar conversa', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Nova conversa', exact: true })
    .click();
  await page.getByLabel('Histórico de conversas', { exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Crie uma tabela para este projeto.',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('button', { name: 'Fixar conversa', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Criar página', exact: true }).click();
  await page
    .getByRole('button', { name: 'Confirmar criação da página', exact: true })
    .click();
  await expect(page).toHaveTitle('Plano novo · Nexo');
  await expect(
    page.locator('[data-testid^="editor-"] affine-table')
  ).toBeVisible();
  await page.getByTestId('ai-chat').click();
  mode = 'html';
  await page
    .getByLabel('Mensagem', { exact: true })
    .fill('Crie um aplicativo HTML.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Executar prévia HTML', exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="Prévia HTML isolada"]');
  await expect(
    frame.getByRole('heading', { name: 'Meu aplicativo' })
  ).toBeVisible();
  await frame.getByRole('button', { name: 'Testar', exact: true }).click();
  await expect(frame.getByRole('heading', { name: 'Funcionou' })).toBeVisible();
  await expect(
    page.locator('iframe[title="Prévia HTML isolada"]')
  ).toHaveAttribute('sandbox', 'allow-scripts');
  expect(errors).toEqual([]);
});

test('only selected workspace pages are sent for analysis', async ({
  page,
}) => {
  let submitted = '';
  await page.route(
    'https://api.openai.com/v1/chat/completions',
    async route => {
      submitted = route.request().postData() ?? '';
      await route.fulfill({
        json: {
          choices: [{ message: { content: 'Análise da página selecionada.' } }],
        },
      });
    }
  );
  await page.goto('/');
  await page.getByTestId('sidebar-new-page-button').click();
  await page.locator('.inline-editor').first().click();
  await page.keyboard.insertText('Fonte para IA');
  await page.locator('.inline-editor').last().click();
  await page.keyboard.insertText('Detalhes escolhidos para análise.');
  await page.getByTestId('ai-chat').click();
  await configure(page);
  await page.getByLabel('Adicionar contexto', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Selecionar páginas do espaço', exact: true })
    .click();
  await page.getByTestId('doc-selector-search-input').fill('Fonte para IA');
  await page
    .getByRole('dialog')
    .getByText('Fonte para IA', { exact: true })
    .click();
  await page.getByTestId('doc-selector-confirm-button').click();
  await page.getByLabel('Adicionar contexto', { exact: true }).click();
  await page
    .getByLabel('Mensagem', { exact: true })
    .fill('Analise a página selecionada.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByText('Análise da página selecionada.', { exact: true })
  ).toBeVisible();
  expect(submitted).toContain('Fonte para IA');
  expect(submitted).toContain('Detalhes escolhidos para análise.');
  expect(submitted).not.toContain('Primeiros passos no Nexo');
});
