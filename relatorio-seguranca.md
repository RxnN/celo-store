# Relatório de Segurança — Celo Store

Auditoria feita a partir do `auditoria.md` como mapa, confirmando cada afirmação diretamente no código-fonte e, em pontos críticos, com testes ao vivo contra o servidor local. Toda linha citada foi lida no momento desta auditoria. Onde não foi possível confirmar com evidência direta, está marcado **NÃO VERIFICÁVEL**.

**Nenhum valor de segredo é reproduzido neste documento — todos estão mascarados, com o local exato apontado.**

---

## Resumo por severidade

| Severidade | Quantidade |
|---|---|
| 🔴 Crítico | 1 |
| 🟠 Alto | 2 |
| 🟡 Médio | 3 |
| 🔵 Baixo / informativo | 2 |
| ✅ Verificado sem achado | 5 |

---

## 🔴 CRÍTICO

### C1 — Senha de administrador em texto plano no código-fonte (seed do banco)

- **Evidência**: `prisma/seed.ts:363` e `prisma/seed.ts:369`
  ```
  363:  const adminPasswordHash = await bcrypt.hash("c***********6", 10);
  ...
  369:      email: "admin@celostore.com.br",
  ```
  (senha mascarada acima; valor real tem 15 caracteres, visível em texto plano na linha 363)
- **Como foi verificado**: leitura direta do arquivo.
- **Descrição**: a senha do usuário administrador padrão está escrita em texto plano no script de seed, junto com o e-mail (`admin@celostore.com.br`, linha 369). O arquivo `prisma/seed.ts` **não está no `.gitignore`** (confirmado em `.gitignore:1-46`) e hoje aparece como `??` (não rastreado) em `git status` — ou seja, na primeira vez que alguém rodar `git add`, essa senha entra no histórico do repositório permanentemente.
- **Impacto**: qualquer pessoa com acesso ao repositório (agora ou em qualquer commit futuro, mesmo que a senha seja trocada depois) tem a senha do admin em texto plano. Se essa credencial não for trocada antes de qualquer ambiente real usar esse seed, é acesso administrativo completo (produtos, pedidos, cupons, banners).

---

## 🟠 ALTO

### A1 — Checkout (formulário público, cria pedidos reais) não tem Turnstile

- **Evidência**: `grep -n "Turnstile" components/checkout/CheckoutForm.tsx` → **nenhuma ocorrência**. Comparar com os 4 formulários que têm Turnstile: `app/(store)/conta/login/page.tsx:75`, `app/(store)/conta/registro/page.tsx:78`, `app/(store)/conta/esqueci-senha/page.tsx:54`, `app/(store)/rastrear/page.tsx:48`.
- **Como foi verificado**: grep direto no componente + comparação com os demais formulários públicos do projeto.
- **Descrição**: `/checkout` é acessível sem login (guest checkout, confirmado em `app/(store)/checkout/page.tsx`) e o formulário que o alimenta (`CheckoutForm.tsx`) não inclui o widget Turnstile nem envia `cfTurnstileToken`. A rota que processa o envio, `app/api/checkout/route.ts`, também não chama `verifyTurnstileToken` em nenhum ponto (confirmado por leitura completa do arquivo, linhas 1–207).
- **Impacto**: é o único formulário público do sistema que cria registros reais no banco (`Order`, `Address`) e decrementa estoque real, sem nenhuma barreira anti-automação. Fica protegido só por rate limit por IP (`app/api/checkout/route.ts:44` — 10 requisições/10min), que é contornável distribuindo requisições por IPs diferentes.

### A2 — `/rastrear` tem Turnstile mas não tem limite de tentativas

- **Evidência**: `app/(store)/rastrear/actions.ts:1-63` — importa e chama `verifyTurnstileToken` (linha 29), mas não importa nem chama `checkRateLimit` em nenhum lugar do arquivo (confirmado por leitura completa).
- **Como foi verificado**: leitura completa do arquivo; comparação com `esqueci-senha/actions.ts:28` e `registro/actions.ts:28`, que usam o mesmo padrão de proteção (Turnstile + rate limit) e este não replica a parte de rate limit.
- **Descrição**: a action de consulta de pedido (`trackOrder`) compara e-mail informado contra `order.user.email` ou `order.guestEmail` (linha 42-43) antes de retornar dados — isso impede vazamento de pedido de terceiros por tentativa isolada. Mas sem rate limit, um script autenticado por Turnstile (que resolve o desafio uma vez e reusa o token, ou que é operado por um humano de forma repetida) pode testar muitas combinações de `orderId` + `email` sem limite de velocidade.
- **Impacto**: reduzido pela alta entropia do `orderId` (cuid, ~25 caracteres aleatórios) — mas a ausência de rate limit é uma diferença objetiva de postura frente aos outros 4 endpoints sensíveis do sistema, todos com dupla proteção (Turnstile + rate limit).

---

## 🟡 MÉDIO

### M1 — Rate limiting é em memória de processo, não distribuído

- **Evidência**: `lib/rate-limit.ts:3` — `const buckets = new Map<string, Bucket>();` (Map local ao processo Node, sem persistência externa).
- **Como foi verificado**: leitura completa de `lib/rate-limit.ts`.
- **Descrição**: os contadores de tentativas (login, cadastro, esqueci-senha, checkout, cupom) vivem em memória do processo Node atual. Reiniciar o processo zera todos os contadores. Se a aplicação rodar em mais de uma instância/processo simultaneamente, cada instância tem seu próprio contador independente.
- **Impacto**: em um único processo (como está hoje em desenvolvimento), a proteção funciona como projetada — confirmado nesta sessão com teste ao vivo (10 tentativas de cupom: as 10 primeiras processam, a partir da 11ª retornam 429). Em um ambiente com múltiplas instâncias rodando ao mesmo tempo, o limite efetivo multiplica pelo número de instâncias.

### M2 — `NEXTAUTH_SECRET` de desenvolvimento é um valor curto e previsível

- **Evidência**: `.env:4` — `NEXTAUTH_SECRET="[mascarado — 40 caracteres, começa com padrão de texto legível 'dev-secret-troque...']"`.
- **Como foi verificado**: leitura de `.env` (arquivo local, confirmado **não rastreado pelo git** — `git ls-files -- .env` não retornou nada, e `git log --all --full-history -- .env` não mostra nenhum commit).
- **Descrição**: o valor usado para assinar os tokens JWT de sessão é uma string legível/previsível, não um valor aleatório de alta entropia. Isso não é um vazamento (o arquivo não está no repositório), mas é o valor que está efetivamente em uso agora.
- **Impacto**: nenhum hoje, porque o arquivo é local e não versionado. Se esse mesmo valor for copiado para um ambiente acessível publicamente sem ser trocado por um valor aleatório forte, tokens de sessão poderiam ser forjados por quem soubesse ou adivinhasse o segredo.

### M3 — Arquivos de log da sessão de desenvolvimento não estão no `.gitignore`

- **Evidência**: `.gitignore:1-46` cobre `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*` — nenhum padrão cobre `.codex-dev.stdout.log` / `.codex-dev.stderr.log`, que aparecem como `??` (não rastreados) em `git status`.
- **Como foi verificado**: leitura de `.gitignore` + `git status --short` + inspeção do conteúdo atual dos dois arquivos (`grep -c "postgres://\|DATABASE_URL\|api_key"` → 0 ocorrências no conteúdo atual).
- **Descrição**: hoje esses arquivos de log não contêm segredo algum (verificado). Mas nada impede que uma futura execução com erro do Prisma (que em determinadas mensagens de erro imprime a `DATABASE_URL` completa, como observado durante esta sessão) grave essa string em um desses logs, e um `git add -A` os inclua no commit.
- **Impacto**: latente, não presente no estado atual verificado.

---

## 🔵 BAIXO / INFORMATIVO

### B1 — `/api/upsell` e `/api/shipping-quote` sem autenticação nem rate limit

- **Evidência**: `app/api/upsell/route.ts:1-44` e `app/api/shipping-quote/route.ts:1-26` — nenhuma chamada a `auth()`, `checkRateLimit` ou `isTrustedOrigin` em nenhum dos dois arquivos.
- **Descrição**: ambos retornam apenas dados públicos de catálogo (produtos ativos, cotação de frete) sem informação pessoal de nenhum usuário.
- **Impacto**: risco de uso indevido de recursos do servidor (chamadas repetidas), não de vazamento de dado.

### B2 — Webhook do Mercado Pago sem validação de assinatura no estado atual

- **Evidência**: `app/api/webhook/mercadopago/route.ts:7-8` — `isValidSignature` retorna `true` sem checar nada se `process.env.MERCADOPAGO_WEBHOOK_SECRET` não estiver definida; `.env` (lido nesta auditoria) **não contém** a chave `MERCADOPAGO_WEBHOOK_SECRET`. Além disso, linha 38 do mesmo arquivo faz o endpoint retornar imediatamente (`{received:true}`) se `MERCADOPAGO_ACCESS_TOKEN` também não estiver definida — e essa variável está vazia em `.env:7`.
- **Descrição**: hoje o endpoint é efetivamente inerte (sempre cai no `return` da linha 38-40 antes de qualquer processamento), porque o Mercado Pago ainda não está configurado neste ambiente.
- **Impacto**: nenhum no estado atual. Passa a valer a checagem de assinatura (linhas 6-32) automaticamente assim que as duas variáveis forem preenchidas — mas só protege de fato se `MERCADOPAGO_WEBHOOK_SECRET` também for configurada; sem ela, a rota aceita qualquer chamada assim que `MERCADOPAGO_ACCESS_TOKEN` estiver presente.

---

## ✅ Verificado sem achado

### V1 — SQL Injection

- **Evidência**: busca por `$queryRaw`, `$executeRaw`, `$queryRawUnsafe`, `$executeRawUnsafe` em todos os arquivos `*.ts`/`*.tsx` do projeto → **0 ocorrências**.
- **Conclusão**: todo acesso a dados passa pelos métodos tipados do Prisma ORM (`findMany`, `create`, `update`, etc.), que parametrizam automaticamente. Nenhum ponto de SQL manual encontrado.

### V2 — XSS / injeção de HTML

- **Evidência**: busca por `dangerouslySetInnerHTML` em todos os arquivos `*.ts`/`*.tsx` → **0 ocorrências**.
- **Conclusão**: todo conteúdo dinâmico é renderizado via JSX, que o React escapa por padrão. Nenhum ponto de inserção de HTML não sanitizado encontrado.

### V3 — IDOR em pedidos (troca de ID na URL)

- **Teste ao vivo realizado**: requisição HTTP direta (`redirect: "manual"`, sem cookie de sessão) para `GET /checkout/pagamento?order={id de um pedido pertencente à conta marcelo.teste@example.com}` → resposta `307`, `Location: /conta/login?callbackUrl=...`, corpo sem nenhum dado do pedido (sem "Total", tamanho de corpo compatível com a página de shell, não com dados do pedido).
- **Segunda checagem**: mesmo teste contra `GET /admin/pedidos/{id}` sem sessão de admin → `307` para `/conta/login`.
- **Evidência de código correspondente**: `app/(store)/checkout/pagamento/page.tsx:21-24` (compara `order.userId` com `session.user.id`); `app/(store)/checkout/sucesso/page.tsx:22-24` (mesma lógica); `proxy.ts:57-61` + `app/admin/layout.tsx` (dupla checagem de admin).
- **Conclusão**: troca de ID na URL não retornou dado de outra conta nos pontos testados.

### V4 — IDOR em endereços (endpoint de exclusão/definir padrão)

- **Evidência**: `app/(store)/conta/(protected)/enderecos/actions.ts:49-50` (`setDefaultAddress`) e `:67-68` (`deleteAddress`) — ambas buscam o endereço por ID e comparam `address.userId !== session.user.id` antes de qualquer mutação, retornando sem fazer nada se não bater.
- **Como foi verificado**: leitura de código (não foi montado um segundo usuário de teste para tentar excluir/alterar endereço de outra conta nesta sessão — ver ressalva abaixo).
- **Ressalva**: **NÃO VERIFICÁVEL por teste ao vivo nesta auditoria** — a confirmação é por leitura de código, não por exploração ativa com duas contas distintas.

### V5 — Rotas de API sem autenticação (mapeamento completo)

| Rota | Autenticação | Evidência |
|---|---|---|
| `/api/auth/[...nextauth]` | é o próprio sistema de auth | `app/api/auth/[...nextauth]/route.ts` |
| `/api/checkout` | opcional (guest checkout aceito por design) | `app/api/checkout/route.ts:52,62` |
| `/api/cupom` | nenhuma (por design — não expõe PII) | `app/api/cupom/route.ts:1-43` |
| `/api/upload` | sessão + `role: ADMIN` obrigatórios | `app/api/upload/route.ts:22-25` |
| `/api/upsell` | nenhuma (dado público) | `app/api/upsell/route.ts:1-44` |
| `/api/shipping-quote` | nenhuma (dado público) | `app/api/shipping-quote/route.ts:1-26` |
| `/api/webhook/mercadopago` | assinatura HMAC condicional (ver B2) | `app/api/webhook/mercadopago/route.ts:6-32,42-44` |

---

## Metodologia

1. Leitura completa (não parcial) de todos os 7 arquivos de rota de API.
2. Leitura completa das server actions envolvidas em autenticação, endereços, checkout e rastreamento de pedido.
3. Grep de padrões de SQL raw e `dangerouslySetInnerHTML` em `*.ts`/`*.tsx` de todo o projeto.
4. Dois testes HTTP ao vivo contra o servidor local (`redirect: "manual"`, sem cookie), tentando trocar o ID de um pedido de outra conta na URL.
5. Inspeção de `.gitignore`, `git status`, `git log --all --full-history` e `git ls-files` para confirmar o que está/esteve versionado.
6. Leitura de `.env` e `prisma/seed.ts` em busca de segredos em texto plano (valores mascarados neste relatório).

Nenhum segredo real foi reproduzido neste documento.
