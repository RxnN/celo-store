# Plano de Ação — Celo Store

Correções para os achados de `relatorio-seguranca.md`, do crítico pro leve. Cada item é pequeno e tem um critério de teste explícito para confirmar que funcionou antes de passar pro próximo.

---

## 1. 🔴 [C1] Tirar a senha de admin em texto plano do `prisma/seed.ts`

**Arquivo**: `prisma/seed.ts:363,369`

**Passos**:
1. Trocar a senha hardcoded por leitura de uma variável de ambiente (ex.: `SEED_ADMIN_PASSWORD`), com um valor de fallback aleatório gerado em tempo de execução (não fixo no código) caso a variável não exista.
2. Documentar `SEED_ADMIN_PASSWORD` em `.env.example` (só o nome da variável, sem valor real).
3. Adicionar ao README (ou a um comentário no próprio `seed.ts`) a instrução de trocar a senha do admin no primeiro login em qualquer ambiente que não seja local.
4. Rodar `git status` antes do próximo commit e confirmar que `prisma/seed.ts` não tem mais a string da senha antiga em texto plano (`grep -n "celo-admin" prisma/seed.ts` deve retornar vazio).

**Teste de verificação**: rodar o seed (`npx prisma db seed`) com `SEED_ADMIN_PASSWORD` definida e sem definida; confirmar em ambos os casos que dá pra logar com a senha resultante, e que a string antiga não aparece mais em nenhum arquivo rastreado (`grep -rn "celo-admin-2026" --include="*.ts"`).

---

## 2. 🟠 [A1] Adicionar Turnstile no checkout

**Arquivos**: `components/checkout/CheckoutForm.tsx`, `app/api/checkout/route.ts`

**Passos** (seguir exatamente o padrão já usado em `esqueci-senha` e `rastrear`):
1. Em `CheckoutForm.tsx`: importar `Turnstile, turnstileEnabled` de `@/components/ui/Turnstile`; adicionar estado `turnstileToken`.
2. Renderizar `<Turnstile onToken={setTurnstileToken} />` + `<input type="hidden" name="cfTurnstileToken" value={turnstileToken ?? ""} />` dentro do formulário.
3. Desabilitar o botão de submit com `disabled={loading || (turnstileEnabled && !turnstileToken)}`.
4. Incluir `cfTurnstileToken: turnstileToken` no corpo do `fetch` para `/api/checkout`.
5. Em `app/api/checkout/route.ts`: adicionar `cfTurnstileToken: z.string().optional()` ao `CheckoutSchema`; chamar `verifyTurnstileToken(parsed.data.cfTurnstileToken)` logo após a checagem de rate limit (linha ~50) e retornar 400 se falhar.

**Teste de verificação**: com `TURNSTILE_SECRET_KEY` de teste configurada (a chave "sempre aprova" já documentada em `.env.example`), completar um checkout de convidado ponta a ponta no navegador e confirmar que o pedido é criado normalmente; depois, chamar `/api/checkout` diretamente por `fetch` sem `cfTurnstileToken` e confirmar que a resposta é rejeitada.

---

## 3. 🟠 [A2] Adicionar rate limit em `/rastrear`

**Arquivo**: `app/(store)/rastrear/actions.ts`

**Passos**:
1. Importar `checkRateLimit` de `@/lib/rate-limit`, `getClientIp` de `@/lib/request-ip` e `headers` de `next/headers` (mesmo padrão de `esqueci-senha/actions.ts:8` e `:19`).
2. Logo após a checagem de Turnstile (linha 32), adicionar: `const ip = getClientIp(await headers()); const rateLimit = checkRateLimit(\`rastrear:${ip}\`, 10, 10 * 60 * 1000); if (!rateLimit.ok) return { error: "Muitas tentativas. Tente novamente em alguns minutos." };`

**Teste de verificação**: rodar 11 chamadas seguidas da action com IDs/e-mails inválidos e confirmar que as 10 primeiras retornam a mensagem de "pedido não encontrado" e a 11ª retorna a mensagem de "muitas tentativas" (mesmo teste já feito nesta auditoria para `/api/cupom`).

---

## 4. 🟡 [M1] Documentar a limitação do rate limit em memória

**Arquivo**: `lib/rate-limit.ts`

**Passos**:
1. Adicionar um comentário no topo do arquivo explicando que os contadores são por processo (não compartilhados entre instâncias), citando quando isso passa a importar (deploy com mais de uma instância simultânea).
2. Não requer mudança de comportamento agora — é um registro de decisão consciente pra não ser redescoberto como "bug" depois.

**Teste de verificação**: nenhum (mudança documental). Se decidir resolver de fato (ex.: migrar pra um store compartilhado como Upstash Redis), isso vira um item separado, maior, fora deste plano.

---

## 5. 🟡 [M2] Gerar um `NEXTAUTH_SECRET` forte

**Arquivo**: `.env:4` (local, não versionado)

**Passos**:
1. Gerar um valor aleatório forte: `openssl rand -base64 32` (ou equivalente).
2. Substituir o valor atual de `NEXTAUTH_SECRET` em `.env` por esse valor gerado.
3. Reiniciar o servidor de desenvolvimento.

**Teste de verificação**: fazer login normalmente após a troca e confirmar que a sessão continua funcionando (sessões antigas assinadas com o segredo anterior serão invalidadas — esperado).

---

## 6. 🟡 [M3] Cobrir os logs de desenvolvimento no `.gitignore`

**Arquivo**: `.gitignore`

**Passos**:
1. Adicionar a linha `.codex-dev.*.log` (ou `*.stdout.log` / `*.stderr.log`, conforme o padrão de nome usado) na seção de logs do `.gitignore`.
2. Confirmar que os arquivos saem da listagem de não-rastreados: `git status --short | grep codex-dev` deve voltar vazio.

**Teste de verificação**: `git check-ignore -v .codex-dev.stdout.log` deve apontar pra regra recém-adicionada.

---

## 7. 🔵 [B2] Preencher `MERCADOPAGO_WEBHOOK_SECRET` quando o Mercado Pago for configurado

**Arquivo**: `.env` (local, não versionado) — nenhuma mudança de código necessária, o suporte já existe em `app/api/webhook/mercadopago/route.ts:6-32`

**Passos**:
1. No momento em que `MERCADOPAGO_ACCESS_TOKEN` for preenchido com uma credencial real, copiar também a assinatura secreta do webhook do painel do Mercado Pago para `MERCADOPAGO_WEBHOOK_SECRET` no `.env`.
2. Não requer mudança de código — a validação de assinatura já está implementada e só precisa da variável presente.

**Teste de verificação**: com as duas variáveis preenchidas, enviar uma notificação de teste pelo simulador de webhooks do Mercado Pago e confirmar (via log do servidor) que a assinatura é validada; depois, enviar manualmente uma requisição POST para `/api/webhook/mercadopago` sem os headers `x-signature`/`x-request-id` corretos e confirmar que retorna `401`.

---

## 8. 🔵 [B1] Decidir se `/api/upsell` e `/api/shipping-quote` precisam de rate limit

**Arquivos**: `app/api/upsell/route.ts`, `app/api/shipping-quote/route.ts`

**Passos** (só se decidir agir — não é obrigatório, ambos só expõem dado público):
1. Se decidir aplicar, seguir o mesmo padrão de `checkRateLimit` já usado em `/api/cupom` (limite mais alto, ex.: 30/min, já que são consultas legítimas e frequentes durante a navegação normal).

**Teste de verificação**: confirmar que a navegação normal do catálogo (que dispara `/api/upsell` e `/api/shipping-quote` várias vezes por sessão) não é bloqueada pelo novo limite antes de considerar concluído.

---

## Ordem sugerida de execução

1 → 2 → 3 → 5 → 6 → 4 → 7 → 8

(itens 1–3 são os únicos com risco real hoje; 5 e 6 são rápidos e sem dependência; 4 é só documentação; 7 e 8 dependem de decisões de negócio — quando o Mercado Pago for ativado, e se o rate limit dos endpoints públicos vale o esforço.)
