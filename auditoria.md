# Auditoria do Sistema — Celo Store

Documento gerado a partir da leitura direta do código-fonte do projeto. Descreve o estado atual do sistema: stack, arquitetura, rotas, banco de dados e configurações.

---

## 1. Visão geral

Celo Store é uma loja virtual de streetwear/roupas esportivas construída como aplicação full-stack única em Next.js (App Router), com painel administrativo embutido na mesma aplicação (`/admin`), autenticação própria (credenciais e-mail/telefone + senha) e integrações opcionais com Mercado Pago (pagamento), Melhor Envio (frete), Resend (e-mail) e Cloudflare Turnstile (anti-bot).

---

## 2. Stack tecnológica

| Camada | Tecnologia | Versão (package.json) |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.12 |
| Runtime UI | React / React DOM | 19.2.4 |
| Linguagem | TypeScript | ^5 |
| Estilos | Tailwind CSS | ^4 (via `@tailwindcss/postcss`) |
| ORM | Prisma | ^7.9.1 |
| Driver de banco | `@prisma/adapter-pg` + `pg` | ^7.9.1 / ^8.22.0 |
| Banco de dados | PostgreSQL | — (local via `prisma dev`, ou qualquer Postgres via `DATABASE_URL`) |
| Autenticação | NextAuth (Auth.js) | ^5.0.0-beta.32 |
| Hash de senha | bcryptjs | ^3.0.3 |
| Estado do carrinho | Zustand (com persistência `localStorage`) | ^5.0.14 |
| Validação | Zod | ^4.4.3 |
| Pagamento | SDK oficial `mercadopago` | ^3.2.1 |
| E-mail transacional | `resend` | ^6.18.1 |
| Lint | ESLint (flat config) + `eslint-config-next` | ^9 / 16.2.12 |
| Execução de scripts TS | `tsx` | ^4.23.1 |

Scripts definidos em `package.json`: `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `lint` (`eslint`).

### Configuração do TypeScript (`tsconfig.json`)
- `strict: true`, `target: ES2017`, `moduleResolution: bundler`, `jsx: react-jsx`.
- Alias de import: `@/*` → raiz do projeto.
- Plugin `next` habilitado para checagem de tipos específica do framework.

### Configuração do ESLint (`eslint.config.mjs`)
- Usa `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript`.
- Ignora `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `.claude/**`, `.agents/**`.

### Configuração do Prisma (`prisma.config.ts`)
- Schema em `prisma/schema.prisma`.
- `datasource.url` = `DATABASE_URL`, `shadowDatabaseUrl` = `SHADOW_DATABASE_URL`.
- Seed configurado via `tsx prisma/seed.ts`.
- Em desenvolvimento, o banco roda via `prisma dev` (Postgres embutido local, portas 51213–51216).

### `next.config.ts`
Arquivo presente sem opções customizadas (`NextConfig` vazio) — usa os defaults do Next.js.

### `postcss.config.mjs`
Presente na raiz, usado pelo plugin `@tailwindcss/postcss` para processar o Tailwind v4.

---

## 3. Estrutura de pastas

```
app/
  layout.tsx                    → layout raiz (fontes, <html>/<body>)
  globals.css                   → tokens de design (CSS custom properties) + Tailwind
  (store)/                      → route group da loja (não aparece na URL)
    layout.tsx                  → Topbar + Footer + CartAddedToast
    page.tsx                    → home
    produto/[slug]/
    categoria/, categoria/[slug]/
    marca/, marca/[slug]/
    busca/
    ofertas/
    carrinho/
    checkout/, checkout/pagamento/, checkout/sucesso/
    conta/
      login/, registro/, esqueci-senha/, redefinir-senha/
      (protected)/              → route group com layout.tsx que exige sessão
        pedidos/, enderecos/, senha/
    rastrear/
    termos-de-uso/, politica-de-privacidade/, trocas-e-devolucoes/
  admin/
    layout.tsx                  → exige sessão com role ADMIN
    produtos/, produtos/novo/, produtos/[id]/
    marcas/, categorias/, subcategorias/
    pedidos/, pedidos/[id]/
    banners/, frete-gratis/, cupons/
  api/
    auth/[...nextauth]/, checkout/, cupom/, upload/, upsell/, shipping-quote/, webhook/mercadopago/
components/
  layout/    → Topbar, NavMenu, MobileNav, Footer, CartButton, SignOutButton, HomeLink
  home/      → HeroCarousel, HeroBrand, CategoryShortcuts, PromoBanners, PromoCard, FeaturedCarousel, promo-theme
  product/   → ProductCard, ProductDetail, ProductGallery, ProductGrid, ProductFilters, SortSelect, ProductSection, UpsellGrid, ProductImagePlaceholder, product-card-data
  cart/      → CartUpsell, CartAddedToast
  checkout/  → CheckoutForm, PaymentConfirmButton
  account/   → AddressForm
  admin/     → ProductForm, VariantEditor, ImageUploader, MultiImageUploader, BannerForm, CouponForm, FreeShippingForm, BrandRow, CategoryRow, SubcategoryRow, OrderStatusForm, DeleteButton
  shared/    → ShippingEstimate
  ui/        → Button, Badge, Turnstile
lib/
  db.ts                → instancia o PrismaClient (singleton via globalThis, driver adapter PrismaPg)
  auth.ts               → configuração do NextAuth (provider Credentials)
  auth-guards.ts         → requireAdmin()
  verify-origin.ts       → checagem de Origin para Route Handlers
  rate-limit.ts          → limitador de taxa em memória (Map)
  request-ip.ts          → extrai IP do cliente dos headers
  cart-store.ts           → store Zustand do carrinho (persistido)
  cart-toast-store.ts     → store Zustand do toast "adicionado ao carrinho"
  coupons.ts              → validação e cálculo de desconto de cupom
  shipping.ts             → orquestra cotação de frete
  shipping-rules.ts       → regras de frete grátis
  melhor-envio.ts         → integração com a API do Melhor Envio
  mercadopago.ts          → criação de preferência de pagamento
  email.ts                → envio de e-mail via Resend
  turnstile.ts            → verificação de token Cloudflare Turnstile
  order-status.ts         → mapa de rótulos de status de pedido
  product-filters.ts      → parsing de filtros de catálogo (querystring → Prisma where/orderBy)
  utils.ts                → formatPrice, calculateShipping, discountPercent, toNumber
  use-mounted.ts           → hook de hidratação client-only
prisma/
  schema.prisma, seed.ts
proxy.ts                   → middleware (Next.js `middleware`/`proxy` export)
next.config.ts, postcss.config.mjs, tsconfig.json, eslint.config.mjs, prisma.config.ts
public/
  images/celo-logo.jpg
  uploads/                 → destino de imagens enviadas via /api/upload
```

---

## 4. Autenticação e autorização

### Provedor (`lib/auth.ts`)
- NextAuth v5, `session: { strategy: "jwt" }`, página de login customizada (`/conta/login`).
- Único provider: `Credentials`, com campos `identifier` (e-mail ou telefone), `password`, `turnstileToken`.
- `authorize()`:
  1. Verifica presença de `identifier`/`password`.
  2. Valida `turnstileToken` via `verifyTurnstileToken` (`lib/turnstile.ts`) — só bloqueia se `TURNSTILE_SECRET_KEY` estiver configurado.
  3. Aplica `checkRateLimit` por chave `login:{ip}:{identifier}` — 5 tentativas / 5 minutos.
  4. Busca `User` por `email` (se `identifier` contém `@`) ou por `phone` (dígitos).
  5. Compara senha com `bcrypt.compare` contra `passwordHash`.
  6. Retorna `{ id, name, email, role }`.
- Callbacks `jwt`/`session` propagam `id` e `role` para o token e para `session.user`.

### Cadastro (`app/(store)/conta/registro/actions.ts`)
- Rate limit `register:{ip}` — 5/10min.
- Validação via Zod (`RegisterSchema`): nome ≥2, e-mail válido, telefone normalizado (10–11 dígitos), senha ≥6.
- Verificação de Turnstile.
- Checa unicidade de `email` e `phone` antes de criar (`db.user.create`, `role: "CUSTOMER"`, senha com `bcrypt.hash(password, 10)`).

### Esqueci/redefinir senha
- `esqueci-senha/actions.ts`: rate limit `forgot-password:{ip}:{identifier}` (5/15min); resposta idêntica (`{ emailSent: true }`) exista ou não a conta; gera token via `crypto.randomBytes(32).toString("hex")` com TTL de 30 minutos (`PasswordResetToken`); envia e-mail via Resend se `RESEND_API_KEY` estiver configurado, senão retorna o link (`resetUrl`) diretamente na resposta.
- `redefinir-senha/actions.ts`: valida token (existe, não usado, não expirado), atualiza `passwordHash` e marca `usedAt` em uma transação.

### Middleware (`proxy.ts`)
- `matcher`: todas as rotas exceto `_next/static`, `_next/image`, `favicon.ico`, `images`, `uploads`.
- Para rotas iniciando em `/admin`, redireciona para `/conta/login?callbackUrl=...` se `session.user.role !== "ADMIN"`.
- Gera nonce por requisição e define headers de segurança em toda resposta (detalhado na seção 8).

### Layout admin (`app/admin/layout.tsx`)
- Segunda camada: redireciona para `/conta/login` se não houver sessão, e para `/` se `role !== "ADMIN"`.

### Proteção de Server Actions do admin
- `lib/auth-guards.ts` exporta `requireAdmin()` (retorna a sessão ou `null`).
- Todas as actions em `app/admin/**/actions.ts` chamam `requireAdmin()` no início e retornam/abortam se `null`.

### Grupo de rotas protegidas do cliente
- `app/(store)/conta/(protected)/layout.tsx`: redireciona para login se não houver sessão; renderiza abas "Meus pedidos", "Meus endereços", "Trocar senha".

---

## 5. Rotas — páginas (App Router)

### Loja (grupo `(store)`, prefixo de URL vazio)

| Rota | Arquivo | Tipo |
|---|---|---|
| `/` | `app/(store)/page.tsx` | Server Component |
| `/produto/[slug]` | `.../produto/[slug]/page.tsx` | Server Component |
| `/categoria` | `.../categoria/page.tsx` | Server Component |
| `/categoria/[slug]` | `.../categoria/[slug]/page.tsx` | Server Component |
| `/marca` | `.../marca/page.tsx` | Server Component |
| `/marca/[slug]` | `.../marca/[slug]/page.tsx` | Server Component |
| `/busca` | `.../busca/page.tsx` | Server Component |
| `/ofertas` | `.../ofertas/page.tsx` | Server Component |
| `/carrinho` | `.../carrinho/page.tsx` | Client Component |
| `/checkout` | `.../checkout/page.tsx` | Server Component |
| `/checkout/pagamento` | `.../checkout/pagamento/page.tsx` | Server Component |
| `/checkout/sucesso` | `.../checkout/sucesso/page.tsx` | Server Component |
| `/conta/login` | `.../conta/login/page.tsx` | Client Component |
| `/conta/registro` | `.../conta/registro/page.tsx` | Client Component |
| `/conta/esqueci-senha` | `.../conta/esqueci-senha/page.tsx` | Client Component |
| `/conta/redefinir-senha` | `.../conta/redefinir-senha/page.tsx` | Client Component |
| `/conta/pedidos` | `.../conta/(protected)/pedidos/page.tsx` | Server Component (exige sessão) |
| `/conta/enderecos` | `.../conta/(protected)/enderecos/page.tsx` | Server Component (exige sessão) |
| `/conta/senha` | `.../conta/(protected)/senha/page.tsx` | (exige sessão) |
| `/rastrear` | `.../rastrear/page.tsx` | Client Component |
| `/termos-de-uso` | `.../termos-de-uso/page.tsx` | estático |
| `/politica-de-privacidade` | `.../politica-de-privacidade/page.tsx` | estático |
| `/trocas-e-devolucoes` | `.../trocas-e-devolucoes/page.tsx` | estático |

### Admin (prefixo `/admin`, exige sessão + `role: ADMIN`)

| Rota | Arquivo |
|---|---|
| `/admin` | `app/admin/page.tsx` (redireciona para `/admin/produtos`) |
| `/admin/produtos` | `app/admin/produtos/page.tsx` |
| `/admin/produtos/novo` | `app/admin/produtos/novo/page.tsx` |
| `/admin/produtos/[id]` | `app/admin/produtos/[id]/page.tsx` |
| `/admin/marcas` | `app/admin/marcas/page.tsx` |
| `/admin/categorias` | `app/admin/categorias/page.tsx` |
| `/admin/subcategorias` | `app/admin/subcategorias/page.tsx` |
| `/admin/pedidos` | `app/admin/pedidos/page.tsx` |
| `/admin/pedidos/[id]` | `app/admin/pedidos/[id]/page.tsx` |
| `/admin/banners` | `app/admin/banners/page.tsx` |
| `/admin/frete-gratis` | `app/admin/frete-gratis/page.tsx` |
| `/admin/cupons` | `app/admin/cupons/page.tsx` |

---

## 6. Rotas de API (`app/api/**/route.ts`)

| Rota | Método | Autenticação | Descrição funcional |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — (é o próprio sistema de auth) | Handlers do NextAuth (`handlers.GET`/`handlers.POST`) |
| `/api/checkout` | POST | Sessão opcional (guest checkout aceito com `guestEmail`) | Cria pedido: valida schema (Zod), rate limit `checkout:{ip}` (10/10min), checa `Origin` (`isTrustedOrigin`), busca variantes, calcula subtotal/frete/desconto, decrementa estoque de forma atômica e condicional dentro de transação (`updateMany` com `stock: {gte}`), cria `Address` + `Order` + `OrderItem[]`, opcionalmente cria preferência no Mercado Pago |
| `/api/cupom` | POST | Nenhuma | Valida um código de cupom contra os itens do carrinho (`validateCoupon`); rate limit `cupom:{ip}` (10/5min) |
| `/api/upload` | POST | Sessão + `role: ADMIN` | Recebe `multipart/form-data`, valida tipo (`jpeg/png/webp/gif`) e tamanho (≤5MB), checa `Origin`, salva em `public/uploads/{uuid}.{ext}` |
| `/api/upsell` | GET | Nenhuma | Recebe `?exclude=id1,id2`, retorna até 8 produtos ativos da(s) mesma(s) categoria(s) dos IDs excluídos |
| `/api/shipping-quote` | POST | Nenhuma | Recebe itens + subtotal + CEP opcional, retorna cotação via `getShippingQuote` |
| `/api/webhook/mercadopago` | POST | Verificação de assinatura HMAC (`x-signature`/`x-request-id`) contra `MERCADOPAGO_WEBHOOK_SECRET`, se configurada | Consulta o pagamento na API do Mercado Pago usando `data.id` do corpo, atualiza `Order.status`/`mpPaymentId` |

---

## 7. Server Actions (`"use server"`)

| Arquivo | Funções exportadas | Autorização interna |
|---|---|---|
| `conta/registro/actions.ts` | `registerUser` | rate limit + Turnstile |
| `conta/esqueci-senha/actions.ts` | `requestPasswordReset` | rate limit + Turnstile |
| `conta/redefinir-senha/actions.ts` | `resetPassword` | validação de token |
| `conta/(protected)/senha/actions.ts` | `changePassword` | exige sessão, confere senha atual |
| `conta/(protected)/enderecos/actions.ts` | `createAddress`, `setDefaultAddress`, `deleteAddress` | exige sessão; `setDefaultAddress`/`deleteAddress` confirmam que o endereço pertence a `session.user.id` antes de mutar |
| `checkout/pagamento/actions.ts` | `confirmPayment` | permite dono da sessão OU pedido sem `userId` (guest) |
| `rastrear/actions.ts` | `trackOrder` | compara e-mail informado com `order.user.email` ou `order.guestEmail` |
| `admin/produtos/actions.ts` | `createProduct`, `updateProduct`, `toggleProduct` | `requireAdmin()` |
| `admin/marcas/actions.ts` | `createBrand`, `updateBrand`, `deleteBrand` | `requireAdmin()` |
| `admin/categorias/actions.ts` | `createCategory`, `updateCategory`, `deleteCategory` | `requireAdmin()` |
| `admin/subcategorias/actions.ts` | `createSubcategory`, `updateSubcategory`, `deleteSubcategory` | `requireAdmin()` |
| `admin/pedidos/actions.ts` | `updateOrderStatus` | `requireAdmin()`; exige `trackingCode` se status = `SHIPPED` |
| `admin/banners/actions.ts` | `createBanner`, `toggleBanner` | `requireAdmin()` |
| `admin/frete-gratis/actions.ts` | `createFreeShippingRule`, `toggleFreeShippingRule`, `deleteFreeShippingRule` | `requireAdmin()` |
| `admin/cupons/actions.ts` | `createCoupon`, `toggleCoupon` | `requireAdmin()` |

Padrão observado: produtos, banners, cupons e regras de frete grátis não têm ação de exclusão definitiva — apenas `toggle`/`active` (inativação). Marcas, categorias e subcategorias têm `delete` real.

---

## 8. Banco de dados

PostgreSQL via Prisma. Datasource único (`db`), gerado com `provider = "prisma-client-js"`.

### Enums

| Enum | Valores |
|---|---|
| `Role` | `CUSTOMER`, `ADMIN` |
| `OrderStatus` | `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELED` |
| `BannerPlacement` | `CARD`, `CAROUSEL`, `HERO` |
| `FreeShippingType` | `MIN_VALUE`, `MIN_QUANTITY`, `SPECIFIC_PRODUCT` |
| `CouponType` | `PERCENT`, `FIXED` |
| `CouponScope` | `ORDER_TOTAL`, `SPECIFIC_PRODUCT` |

### Tabelas (models)

**User**
`id` (cuid, PK), `name`, `email` (unique), `phone` (unique), `passwordHash`, `role` (default `CUSTOMER`), `createdAt`. Relações: `addresses[]`, `orders[]`, `resetTokens[]`.

**PasswordResetToken**
`id`, `userId` → `User` (cascade on delete), `token` (unique), `expiresAt`, `usedAt` (nullable), `createdAt`.

**Address**
`id`, `userId` (nullable) → `User?` (cascade on delete), `label` (nullable), `recipient`, `street`, `number`, `complement` (nullable), `neighborhood`, `city`, `state`, `zip`, `phone`, `isDefault` (default `false`). Relação: `orders[]`. Índice em `userId`.

**Brand**
`id`, `name` (unique), `slug` (unique). Relação: `products[]`.

**Category**
`id`, `name` (unique), `slug` (unique). Relações: `products[]`, `subcategories[]`.

**Subcategory**
`id`, `name`, `slug`, `categoryId` → `Category` (cascade on delete). Relação: `products[]`. Índice único composto `[categoryId, slug]`.

**Product**
`id`, `name`, `slug` (unique), `description`, `price` (`Decimal(10,2)`), `compareAtPrice` (nullable), `featured` (default `false`), `active` (default `true`), `brandId` (nullable) → `Brand?`, `categoryId` → `Category`, `subcategoryId` (nullable) → `Subcategory?`, `createdAt`, `weightGrams`/`heightCm`/`widthCm`/`lengthCm` (todos nullable, `Int`). Relações: `variants[]`, `images[]`, `orderItems[]`, `freeShipping[]`, `coupons[]`. Índices: `categoryId`, `brandId`, `subcategoryId`.

**ProductImage**
`id`, `productId` → `Product` (cascade on delete), `url`, `position` (default `0`). Índice em `productId`.

**ProductVariant**
`id`, `productId` → `Product` (cascade on delete), `size`, `color`, `stock` (default `0`). Relação: `orderItems[]`. Índice único composto `[productId, size, color]`.

**Banner**
`id`, `title`/`subtitle`/`ctaLabel`/`ctaHref` (todos nullable), `theme` (default `"cyan"`), `imageUrl` (nullable), `imageOnly` (default `false`), `placement` (default `CARD`), `position` (default `0`), `active` (default `true`).

**FreeShippingRule**
`id`, `label`, `type` (`FreeShippingType`), `minValue` (nullable `Decimal`), `minQuantity` (nullable `Int`), `productId` (nullable) → `Product?`, `active` (default `true`), `createdAt`.

**Coupon**
`id`, `code` (unique), `type` (`CouponType`), `value` (`Decimal`), `scope` (`CouponScope`), `productId` (nullable) → `Product?`, `active` (default `true`), `createdAt`. Relação: `orders[]`.

**Order**
`id`, `userId` (nullable) → `User?`, `guestName`/`guestEmail`/`guestPhone` (nullable — preenchidos quando `userId` é nulo), `addressId` → `Address`, `subtotal`/`shipping` (default `0`)/`discount` (default `0`)/`total` (todos `Decimal(10,2)`), `couponId` (nullable) → `Coupon?`, `status` (default `PENDING`), `trackingCode` (nullable), `mpPreferenceId`/`mpPaymentId` (nullable), `createdAt`, `updatedAt`. Relação: `items[]`. Índice em `userId`.

**OrderItem**
`id`, `orderId` → `Order` (cascade on delete), `productId` → `Product`, `variantId` → `ProductVariant`, `quantity` (`Int`), `unitPrice` (`Decimal(10,2)`). Índice em `orderId`.

---

## 9. Lógica de negócio central (`lib/`)

- **`coupons.ts`**: `validateCoupon(code, items, subtotal)` busca o cupom (case-insensitive via `.toUpperCase()`), checa `active`, calcula desconto via `calculateCouponDiscount`. Para escopo `ORDER_TOTAL`, desconto = percentual do subtotal ou valor fixo, limitado ao subtotal. Para `SPECIFIC_PRODUCT`, desconto calculado só sobre os itens do produto-alvo presentes no carrinho, limitado ao subtotal desses itens.
- **`shipping.ts`** (`getShippingQuote`): ordem de resolução — 1) `isFreeShippingApplicable` (regras cadastradas); 2) se Melhor Envio configurado e CEP válido (8 dígitos), cotação via API externa (menor preço entre as opções retornadas); 3) fallback: `calculateShipping` (frete fixo de `lib/utils.ts`, grátis acima de R$250, senão R$19,90).
- **`shipping-rules.ts`**: avalia regras `FreeShippingRule` ativas (`MIN_VALUE`, `MIN_QUANTITY`, `SPECIFIC_PRODUCT`) — basta uma regra bater para liberar frete grátis.
- **`melhor-envio.ts`**: monta payload com dimensões/peso do produto (fallback: 300g, 10×15×20cm) e chama `POST /me/shipment/calculate` (sandbox ou produção conforme `MELHOR_ENVIO_SANDBOX`).
- **`mercadopago.ts`**: monta itens (produtos + frete + desconto como linha negativa) e cria uma `Preference`, com `back_urls` apontando para `/checkout/sucesso` e `/checkout?falha=1`, e `notification_url` para o webhook.
- **`product-filters.ts`**: converte querystring (`precoMin`, `precoMax`, `tamanho`, `marca`, `ordenar`) em `Prisma.ProductWhereInput`/`OrderByWithRelationInput`. Usado em `/categoria/[slug]`, `/marca/[slug]`, `/busca`, `/ofertas`.
- **`rate-limit.ts`**: `checkRateLimit(key, limit, windowMs)` — contador em memória (`Map<string, {count, resetAt}>` no processo Node), com varredura de limpeza a cada 5 minutos.
- **`verify-origin.ts`**: `isTrustedOrigin(request)` — compara host do header `Origin` com o header `Host` da requisição; permite requisições sem `Origin`.
- **`turnstile.ts`**: `verifyTurnstileToken(token)` chama `https://challenges.cloudflare.com/turnstile/v0/siteverify` com `TURNSTILE_SECRET_KEY`; retorna `true` sem chamar a API se a chave não estiver configurada.
- **`email.ts`**: `sendPasswordResetEmail` via SDK do Resend; `isEmailConfigured()` checa presença de `RESEND_API_KEY`.

---

## 10. Configurações e headers de segurança (`proxy.ts`)

Aplicados a toda resposta (exceto assets estáticos, ver matcher):

| Header | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`; `script-src 'self' 'nonce-{gerado por requisição}' 'strict-dynamic'` (+ `'unsafe-eval'` quando `NODE_ENV !== "production"`); `style-src 'self' 'unsafe-inline'`; `img-src 'self' blob: data:`; `font-src 'self'`; `connect-src 'self' https://viacep.com.br https://challenges.cloudflare.com`; `frame-src https://challenges.cloudflare.com https://maps.google.com`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests` (só em produção) |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (só em produção) |

O nonce gerado também é propagado via header de requisição `x-nonce` para uso interno do Next.js nos seus próprios scripts/estilos.

---

## 11. Variáveis de ambiente (`.env.example`)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão Postgres (Prisma) |
| `SHADOW_DATABASE_URL` | Banco-sombra do Prisma (migrations) |
| `NEXTAUTH_SECRET` | Chave de assinatura das sessões JWT |
| `NEXTAUTH_URL` | URL base usada em callbacks/links (auth, Mercado Pago, e-mail) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token da API do Mercado Pago |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Chave pública do Mercado Pago (client-side) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Segredo usado para validar a assinatura do webhook |
| `MELHOR_ENVIO_TOKEN` | Token da API do Melhor Envio |
| `MELHOR_ENVIO_SANDBOX` | `"true"`/`"false"` — alterna sandbox/produção |
| `STORE_ORIGIN_ZIP` | CEP de origem para cotação de frete |
| `RESEND_API_KEY` | Chave da API do Resend |
| `RESEND_FROM_EMAIL` | Remetente usado nos e-mails transacionais |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key pública do Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Secret key do Cloudflare Turnstile (verificação server-side) |

Todas as integrações externas (Mercado Pago, Melhor Envio, Resend, Turnstile) têm função `isXConfigured()` correspondente e caem em comportamento alternativo quando a variável não está definida (ex.: checkout sem Mercado Pago cai em tela de pagamento simulada local; sem Resend, o link de redefinição de senha é exibido diretamente na tela).

---

## 12. Recursos estáticos e uploads

- `public/images/celo-logo.jpg` — logo da loja, usada em Topbar, MobileNav e favicon-like avatar.
- `public/uploads/` — destino de imagens enviadas por administradores via `/api/upload` (produtos e banners), nomeadas por UUID.

---

## 13. Integrações externas

| Serviço | Onde é usado | Configuração |
|---|---|---|
| Mercado Pago | Criação de preferência de pagamento no checkout; webhook de confirmação | `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` |
| Melhor Envio | Cotação de frete por CEP | `MELHOR_ENVIO_TOKEN`, `MELHOR_ENVIO_SANDBOX`, `STORE_ORIGIN_ZIP` |
| Resend | Envio do e-mail de redefinição de senha | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Cloudflare Turnstile | Verificação anti-bot em login, cadastro, esqueci-senha e rastrear pedido | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| ViaCEP | Autopreenchimento de endereço a partir do CEP (chamada client-side em `CheckoutForm.tsx`) | sem chave, API pública |
| Google Maps (embed) | Iframe de localização no rodapé | sem chave, embed público |

---

*Documento gerado por leitura estática do código em `C:\Users\460cp\Downloads\projeto_marcelo`. Reflete o estado dos arquivos no momento da geração.*
