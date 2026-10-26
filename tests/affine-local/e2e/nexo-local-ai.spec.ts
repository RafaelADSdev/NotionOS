import { expect, test } from '@playwright/test';

test('Claude native API can be selected, restored and used for chat', async ({
  page,
}) => {
  const errors: string[] = [];
  const payloads: {
    system: string;
    messages: { role: string; content: string }[];
  }[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://api.anthropic.com/v1/messages', async route => {
    const headers = route.request().headers();
    expect(headers['x-api-key']).toBe('nexo-fake-claude-key');
    expect(headers['anthropic-version']).toBe('2026-10-21');
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(headers.authorization).toBeUndefined();
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        content: [
          { type: 'thinking', thinking: 'Never display this' },
          { type: 'text', text: 'Resposta simulada do Claude.' },
        ],
      },
    });
  });
  await page.goto('/');
  await page.getByTestId('ai-chat').click();
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await page
    .getByLabel('Chave de API', { exact: true })
    .fill('other-provider-secret');
  await page.getByLabel('Provedor', { exact: true }).selectOption('anthropic');
  await expect(page.getByLabel('Chave de API', { exact: true })).toHaveValue(
    ''
  );
  await expect(page.getByLabel('URL base da API')).toHaveValue(
    'https://api.anthropic.com/v1'
  );
  await page.getByLabel('Modelo', { exact: true }).fill('test-claude-model');
  await page
    .getByLabel('Chave de API', { exact: true })
    .fill('nexo-fake-claude-key');
  await page.getByLabel('Lembrar nesta aba').check();
  await page.getByRole('button', { name: 'Testar conexão' }).click();
  await expect(
    page.getByText('Conexão confirmada. Salve para usar esta configuração.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await page.getByTestId('modal-close-button').click();
  await page.reload();
  await page
    .getByLabel('Mensagem', { exact: true })
    .fill('Claude, me ajude com uma nota.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByText('Resposta simulada do Claude.', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('Never display this')).toHaveCount(0);
  expect(payloads.at(-1)?.system).toContain('copiloto do Nexo');
  expect(payloads.at(-1)?.messages).toEqual([
    { role: 'user', content: 'Claude, me ajude com uma nota.' },
  ]);
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await expect(page.getByLabel('Provedor', { exact: true })).toHaveValue(
    'anthropic'
  );
  await expect(page.getByLabel('Modelo', { exact: true })).toHaveValue(
    'test-claude-model'
  );
  expect(errors).toEqual([]);
});

test('personal API key config, chat, errors, cancellation and removal work without cloud', async ({
  page,
}) => {
  const cloudRequests: string[] = [];
  const pageErrors: string[] = [];
  const requests: { messages: { role: string; content: string }[] }[] = [];
  let mode: 'ok' | 'unauthorized' | 'pending' = 'ok';
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => {
    if (
      /\/(api\/(auth|telemetry)|graphql|socket\.io)(\/|\?|$)/.test(
        request.url()
      )
    )
      cloudRequests.push(request.url());
  });
  await page.route(
    'https://api.openai.com/v1/chat/completions',
    async route => {
      expect(route.request().headers().authorization).toBe(
        'Bearer nexo-fake-key-for-test'
      );
      requests.push(route.request().postDataJSON());
      if (mode === 'pending') {
        // Release the browser interception after the UI has a chance to cancel.
        await new Promise(resolve => setTimeout(resolve, 750));
      }
      if (mode === 'unauthorized') {
        await route.fulfill({ status: 401, body: 'nexo-fake-key-for-test' });
      } else {
        await route.fulfill({
          json: {
            choices: [
              { message: { content: 'Resposta simulada para o Nexo.' } },
            ],
          },
        });
      }
    }
  );

  await page.goto('/');
  await page.getByTestId('ai-chat').click();
  await expect(
    page.getByRole('button', { name: 'Enviar', exact: true })
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await page.getByLabel('Modelo', { exact: true }).fill('test-model');
  await page
    .getByLabel('Chave de API', { exact: true })
    .fill('nexo-fake-key-for-test');
  await page.getByRole('button', { name: 'Testar conexão' }).click();
  await expect(
    page.getByText('Conexão confirmada. Salve para usar esta configuração.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await page.getByTestId('modal-close-button').click();
  await page.getByLabel('Mensagem', { exact: true }).fill('Escreva uma ideia.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByText('Resposta simulada para o Nexo.', { exact: true })
  ).toBeVisible();
  expect(requests.at(-1)?.messages.at(-1)?.content).toBe('Escreva uma ideia.');

  mode = 'unauthorized';
  await page.getByLabel('Mensagem', { exact: true }).fill('Outra pergunta');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    page.getByText('Chave de API inválida ou expirada.')
  ).toBeVisible();
  await expect(page.getByLabel('Mensagem', { exact: true })).toHaveValue(
    'Outra pergunta'
  );
  mode = 'pending';
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('button', { name: 'Parar', exact: true }).click();
  await expect(
    page.getByText('Solicitação interrompida. Você pode tentar novamente.')
  ).toBeVisible();
  await page.unrouteAll({ behavior: 'wait' });

  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Enviar', exact: true })
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await expect(page.getByLabel('Modelo', { exact: true })).toHaveValue(
    'test-model'
  );
  await expect(page.getByLabel('Chave de API', { exact: true })).toHaveValue(
    ''
  );
  await page
    .getByLabel('Chave de API', { exact: true })
    .fill('nexo-fake-key-for-test');
  await page.getByLabel('Lembrar nesta aba').check();
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await page.getByTestId('modal-close-button').click();
  await page.reload();
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await expect(page.getByLabel('Chave de API', { exact: true })).toHaveValue(
    'nexo-fake-key-for-test'
  );
  await page.getByRole('button', { name: 'Remover chave' }).click();
  await expect(page.getByLabel('Chave de API', { exact: true })).toHaveValue(
    ''
  );
  await page.getByTestId('modal-close-button').click();
  await page.reload();
  await page.getByRole('button', { name: 'Configurar IA' }).click();
  await expect(page.getByLabel('Chave de API', { exact: true })).toHaveValue(
    ''
  );
  expect(cloudRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('note text is opt-in and generated text is appended and persists', async ({
  page,
}) => {
  const requests: { messages: { role: string; content: string }[] }[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(
    'https://api.openai.com/v1/chat/completions',
    async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({
        json: {
          choices: [{ message: { content: 'Uma resposta para acrescentar.' } }],
        },
      });
    }
  );
  await page.goto('/');
  await page.getByTestId('sidebar-new-page-button').click();
  await page.locator('.inline-editor').first().click();
  await page.keyboard.insertText('Nota com IA própria');
  await page.locator('.inline-editor').last().click();
  await page.keyboard.insertText('Conteúdo privado de teste.');
  await page.getByTestId('slider-bar-workspace-setting-button').click();
  await page.getByTestId('local-ai-panel-trigger').click();
  await page.getByLabel('Modelo', { exact: true }).fill('test-model');
  await page
    .getByLabel('Chave de API', { exact: true })
    .fill('nexo-fake-key-for-test');
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await page.getByTestId('modal-close-button').click();
  if (!(await page.getByTestId('sidebar-tab-chat').isVisible())) {
    await page.getByTestId('right-sidebar-toggle').click();
  }
  await page.getByTestId('sidebar-tab-chat').click();
  const panel = page.getByRole('region', { name: 'Assistente de IA do Nexo' });
  await panel.getByLabel('Mensagem', { exact: true }).fill('Me dê uma ideia.');
  await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(
    panel.getByText('Uma resposta para acrescentar.', { exact: true })
  ).toBeVisible();
  expect(JSON.stringify(requests.at(-1))).not.toContain('Conteúdo privado');
  await panel.getByRole('button', { name: 'Nova conversa' }).click();
  await panel.getByLabel('Adicionar contexto', { exact: true }).click();
  await panel.getByLabel('Incluir texto desta nota').check();
  await panel.getByRole('button', { name: 'Resumir', exact: true }).click();
  await expect(
    panel.getByText('Uma resposta para acrescentar.', { exact: true })
  ).toBeVisible();
  expect(requests.at(-1)?.messages.at(-1)?.content).toContain(
    'Conteúdo privado de teste.'
  );
  expect(requests.at(-1)?.messages.at(-1)?.content).toContain(
    'Nota com IA própria'
  );
  await panel.getByRole('button', { name: 'Inserir na nota' }).click();
  await page
    .getByRole('button', { name: 'Acrescentar ao final', exact: true })
    .click();
  await expect(
    page
      .locator('[data-testid^="editor-"] affine-paragraph')
      .getByText('Uma resposta para acrescentar.', { exact: true })
  ).toBeVisible();
  await expect(
    page
      .locator('[data-testid^="editor-"] affine-paragraph')
      .getByText('Conteúdo privado de teste.', { exact: true })
  ).toBeVisible();
  await page.screenshot({ path: '.codex/local-ai-note-dark.png' });
  await panel.getByRole('button', { name: 'Inserir na nota' }).click();
  await page
    .getByRole('button', { name: 'Substituir texto da nota', exact: true })
    .click();
  await expect(
    page
      .locator('[data-testid^="editor-"] affine-paragraph')
      .getByText('Conteúdo privado de teste.', { exact: true })
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page
      .locator('[data-testid^="editor-"] affine-paragraph')
      .getByText('Uma resposta para acrescentar.', { exact: true })
  ).toBeVisible();
  expect(errors).toEqual([]);
});
