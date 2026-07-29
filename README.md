# Celo Store

Loja online de roupas esportivas/streetwear, construída com Next.js (App Router), Prisma/PostgreSQL, NextAuth e Zustand.

## Rodando localmente

1. Suba o banco de dados local (Prisma Postgres embutido, sem precisar de Docker):

   ```bash
   npx prisma dev -d
   ```

   Isso mantém um Postgres local rodando em background. Se a máquina reiniciar, rode o comando de novo (ele reaproveita o servidor `default` já criado). Para ver o status: `npx prisma dev ls`.

2. Instale as dependências e rode o servidor:

   ```bash
   npm install
   npm run dev
   ```

3. Acesse [http://localhost:3000](http://localhost:3000).

### Banco de dados

- `npx prisma db push` — sincroniza o schema (`prisma/schema.prisma`) com o banco.
- `npx prisma db seed` — popula categorias, marcas, produtos, banners e o usuário admin.
- `npx prisma studio` — abre uma UI pra inspecionar os dados.

Usuário admin de teste (criado pelo seed): `admin@celostore.com.br` / `celo-admin-2026`. Troque a senha (ou remova o usuário) antes de ir pra produção.

### Variáveis de ambiente (`.env`)

- `DATABASE_URL` / `SHADOW_DATABASE_URL` — já apontam pro banco local do `prisma dev`. Em produção, troque pela connection string do [Neon](https://neon.tech) (ou outro Postgres gerenciado).
- `NEXTAUTH_SECRET` — troque por um valor aleatório forte em produção (`openssl rand -base64 32`).
- `NEXTAUTH_URL` — URL pública do site em produção.
- `MERCADOPAGO_ACCESS_TOKEN` / `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` — credenciais de teste (sandbox) ou produção da sua conta [Mercado Pago Developers](https://www.mercadopago.com.br/developers). **Enquanto estiverem vazias, o checkout roda em modo sandbox local**: o pedido é criado e marcado como pago direto, sem depender do Mercado Pago, pra dar pra testar o fluxo completo sem conta externa.
- `MELHOR_ENVIO_TOKEN` / `STORE_ORIGIN_ZIP` — token da sua conta no [Melhor Envio](https://melhorenvio.com.br) e o CEP de onde os pedidos saem. **Enquanto estiverem vazios, o frete usa a regra fixa** (grátis acima de R$250, senão R$19,90) em vez de cotar de verdade. `MELHOR_ENVIO_SANDBOX=true` usa o ambiente de testes deles; mude pra `false` quando for pra produção.
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — API key da sua conta no [Resend](https://resend.com) (plano gratuito cobre até 3.000 e-mails/mês) e o remetente do e-mail. **Enquanto `RESEND_API_KEY` estiver vazia, o link de redefinição de senha aparece direto na tela** em vez de ser enviado por e-mail. Sem domínio próprio verificado no Resend, use o remetente padrão de testes `onboarding@resend.dev` (só envia pro e-mail da conta usada pra criar a chave); com um domínio verificado, troque `RESEND_FROM_EMAIL` pelo seu.

## Painel administrativo

Acesse `/admin` logado como usuário com papel `ADMIN`. Permite gerenciar produtos (com variações de tamanho/cor/estoque, até 6 fotos, peso e dimensões pro cálculo de frete), marcas, categorias, subcategorias, promoções (card/carrossel/banner cheio, com foto própria), regras de frete grátis, e o status/rastreio dos pedidos.

### Frete grátis

Cadastradas em `/admin/frete-gratis`: valor mínimo do carrinho, quantidade mínima de itens, ou um produto específico. Basta **uma** regra ativa valer pro carrinho do cliente pra liberar o frete grátis — mesmo com a API do Melhor Envio configurada, a checagem de frete grátis vem primeiro.

## Deploy

- **App**: [Vercel](https://vercel.com) (tier gratuito é suficiente pra começar)
- **Banco**: [Neon](https://neon.tech) Postgres (tier gratuito)
- **Imagens de produto**: quando forem substituir os placeholders por fotos reais, recomenda-se um bucket como [Cloudflare R2](https://developers.cloudflare.com/r2/)

Veja mais detalhes de custo/escalabilidade no histórico de planejamento do projeto.
