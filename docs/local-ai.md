# IA com chave própria no Nexo

O assistente local usa a API nativa do Claude (Anthropic) ou uma API compatível
com OpenAI Chat Completions, sem conta,
assinatura ou servidor do AFFiNE. As notas continuam no armazenamento local.

- Em **Configurações → Inteligência artificial**, selecione o provedor e informe a URL base, o identificador
  de um modelo disponível na sua conta e sua chave de API.
- Para OpenAI, use `https://api.openai.com/v1`. Outros serviços precisam oferecer
  `POST /chat/completions` e permitir chamadas do navegador via CORS.
- Para Claude, selecione **Claude (Anthropic)**. A URL padrão é
  `https://api.anthropic.com/v1`; a integração usa `POST /messages`, com o cabeçalho
  de acesso direto do navegador e a versão `2026-10-21` da API. Informe um modelo
  disponível na sua conta Anthropic e uma chave da API. Se sua chave exigir um
  workspace, preencha seu ID no campo opcional. Trocar o provedor limpa a chave e
  o modelo do formulário para evitar enviar credenciais ao serviço errado.
- A chave fica na memória por padrão. A opção **Lembrar nesta aba** usa
  `sessionStorage`, acessível ao aplicativo e a scripts da mesma origem. Não há
  criptografia ou cofre de credenciais no aplicativo web. **Remover chave** apaga
  a cópia da sessão e da memória. URL e modelo podem ser lembrados sem a chave.
- Abra **Chat com IA** na navegação ou a aba de IA na lateral de uma nota.
  A tela segue a composição do chat original: mensagem inicial centralizada,
  campo de mensagem, contexto no botão **+**, modelo e envio circular.
- No botão **+**, ative **Incluir texto desta nota**, selecione até oito páginas
  do espaço ou adicione um arquivo TXT/Markdown. Somente os itens selecionados
  são enviados; o limite combinado é de 60.000 caracteres. Arquivos de imagem,
  PDF, áudio e conteúdos de páginas incorporadas não são extraídos automaticamente.
- Respostas usam o renderizador original do editor, com títulos, listas, tabelas
  e código. **Inserir na nota** abre uma prévia: escolha acrescentar ao final ou
  substituir o texto do primeiro bloco de nota. Título e outros blocos do quadro
  permanecem. **Criar página** pede confirmação e cria uma página com a resposta.
- **Nova conversa** inicia outra conversa. O histórico do ícone superior permite
  reabrir e fixar conversas desta tela. Ele fica em memória e é apagado ao sair
  da tela, recarregar ou escolher **Apagar histórico**. Limpar o contexto selecionado
  não remove o conteúdo que já foi enviado em mensagens anteriores.

## Pesquisa na web

Ative **Pesquisar na web** no botão **+**. Claude usa a ferramenta nativa de busca
da Anthropic; OpenAI oficial usa a API Responses com `web_search` e `store: false`.
A ferramenta precisa estar disponível na conta e no modelo escolhido. O modelo
pode decidir não buscar se a pergunta não exigir pesquisa. Fontes devolvidas pela
API são exibidas como links na resposta. Não há pesquisa simulada nem fallback
automático para outro provedor. APIs compatíveis com Chat Completions podem ser
usadas para texto, mas não recebem a ferramenta de busca da OpenAI automaticamente.

## Páginas, apresentações e pequenos aplicativos

Peça tabelas, listas, planos, tarefas ou páginas em Markdown e aplique a resposta
pela prévia. Para apresentações e pequenos aplicativos, peça um HTML completo e
autocontido em um bloco de código `html`. **Executar prévia HTML** abre o resultado
em um iframe com origem isolada, sem acesso ao aplicativo, às notas ou à chave.
A política de conteúdo bloqueia recursos externos, fetch, formulários e frames
aninhados. Código só é executado após esse clique; não é executado no editor ou
no computador do usuário. Essa prévia não instala dependências, não cria um
backend e não produz automaticamente um arquivo PowerPoint.

O provedor pode cobrar pelo uso da API. Não é necessário compartilhar a chave no
chat do Codex. Requisições podem ser interrompidas com **Parar**; o provedor pode
ter processado parte da solicitação antes do cancelamento.

Esta integração cobre escrita, resumo, revisão, tradução, explicações, pesquisa
com ferramentas do provedor, análise de contexto selecionado, criação e edição
confirmada de páginas e prévias HTML. Geração de imagens, transcrição, indexação
automática de todo o espaço e edição automática do quadro não são ativadas.
Não há fallback para os servidores do AFFiNE.

Referência do protocolo: https://developers.openai.com/api/reference/resources/chat

Referências Claude: https://platform.claude.com/docs/en/api/overview e
https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts

Busca: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
e https://developers.openai.com/api/docs/guides/tools-web-search
