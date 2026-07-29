import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Camisetas", slug: "camisetas" },
  { name: "Bermudas & Shorts", slug: "bermudas-shorts" },
  { name: "Calçados", slug: "calcados" },
  { name: "Casacos & Conjuntos", slug: "casacos-conjuntos" },
  { name: "Bonés", slug: "bones" },
  { name: "Acessórios", slug: "acessorios" },
];

const BRANDS = [
  { name: "Athos", slug: "athos" },
  { name: "Nortik", slug: "nortik" },
  { name: "Vertik", slug: "vertik" },
  { name: "Prisma Sport", slug: "prisma-sport" },
];

const SUBCATEGORIES: { category: string; name: string; slug: string }[] = [
  { category: "camisetas", name: "Manga Curta", slug: "manga-curta" },
  { category: "camisetas", name: "Regata", slug: "regata" },
  { category: "camisetas", name: "Estampada", slug: "estampada" },
  { category: "bermudas-shorts", name: "Training", slug: "training" },
  { category: "bermudas-shorts", name: "Moletom", slug: "moletom" },
  { category: "bermudas-shorts", name: "Praia", slug: "praia" },
  { category: "calcados", name: "Tênis", slug: "tenis" },
  { category: "calcados", name: "Chinelos", slug: "chinelos" },
  { category: "casacos-conjuntos", name: "Jaquetas", slug: "jaquetas" },
  { category: "casacos-conjuntos", name: "Conjuntos", slug: "conjuntos" },
  { category: "bones", name: "Aba Curva", slug: "aba-curva" },
  { category: "bones", name: "Aba Reta", slug: "aba-reta" },
  { category: "acessorios", name: "Meias", slug: "meias" },
  { category: "acessorios", name: "Mochilas", slug: "mochilas" },
  { category: "acessorios", name: "Garrafas", slug: "garrafas" },
];

const CLOTHING_SIZES = ["P", "M", "G", "GG"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];
const COLORS = ["Preto", "Azul", "Cinza"];

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subcategory?: string;
  brand: string;
  featured?: boolean;
  sizes: string[];
  colors: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Camiseta Performance Dry",
    slug: "camiseta-performance-dry",
    description:
      "Camiseta de treino em tecido dry-fit, secagem rápida e toque leve para qualquer treino.",
    price: 89,
    compareAtPrice: 120,
    category: "camisetas",
    subcategory: "manga-curta",
    brand: "athos",
    featured: true,
    sizes: CLOTHING_SIZES,
    colors: COLORS,
  },
  {
    name: "Camiseta Air Flow Bordada",
    slug: "camiseta-air-flow-bordada",
    description: "Camiseta com bordado frontal e malha respirável Air Flow.",
    price: 99,
    category: "camisetas",
    subcategory: "manga-curta",
    brand: "prisma-sport",
    sizes: CLOTHING_SIZES,
    colors: ["Preto", "Branco"],
  },
  {
    name: "Camiseta Estampada Team",
    slug: "camiseta-estampada-team",
    description: "Camiseta estampada com caimento reto, ideal para o dia a dia.",
    price: 70,
    compareAtPrice: 100,
    category: "camisetas",
    subcategory: "estampada",
    brand: "nortik",
    sizes: CLOTHING_SIZES,
    colors: COLORS,
  },
  {
    name: "Shorts Training Flex",
    slug: "shorts-training-flex",
    description: "Shorts leve com cós elástico e tecido flexível para treino de alta intensidade.",
    price: 69,
    compareAtPrice: 95,
    category: "bermudas-shorts",
    subcategory: "training",
    brand: "athos",
    featured: true,
    sizes: CLOTHING_SIZES,
    colors: COLORS,
  },
  {
    name: "Bermuda Moletom Cargo",
    slug: "bermuda-moletom-cargo",
    description: "Bermuda de moletom com bolsos cargo e cordão ajustável.",
    price: 99,
    compareAtPrice: 150,
    category: "bermudas-shorts",
    subcategory: "moletom",
    brand: "vertik",
    sizes: CLOTHING_SIZES,
    colors: COLORS,
  },
  {
    name: "Bermuda Praia Estampada",
    slug: "bermuda-praia-estampada",
    description: "Bermuda estampada de secagem rápida para praia ou piscina.",
    price: 65,
    compareAtPrice: 80,
    category: "bermudas-shorts",
    subcategory: "praia",
    brand: "nortik",
    sizes: CLOTHING_SIZES,
    colors: ["Azul", "Verde"],
  },
  {
    name: "Tênis Runner Air",
    slug: "tenis-runner-air",
    description: "Tênis de corrida com entressola amortecida e cabedal respirável.",
    price: 279,
    compareAtPrice: 350,
    category: "calcados",
    subcategory: "tenis",
    brand: "vertik",
    featured: true,
    sizes: SHOE_SIZES,
    colors: ["Preto", "Branco"],
  },
  {
    name: "Chinelo Slide Comfort",
    slug: "chinelo-slide-comfort",
    description: "Chinelo slide com palmilha macia e tira ajustável.",
    price: 45,
    category: "calcados",
    subcategory: "chinelos",
    brand: "athos",
    sizes: ["38", "39", "40", "41", "42"],
    colors: ["Preto", "Cinza"],
  },
  {
    name: "Jaqueta Corta-Vento",
    slug: "jaqueta-corta-vento",
    description: "Jaqueta corta-vento com capuz removível e bolsos com zíper.",
    price: 179,
    compareAtPrice: 220,
    category: "casacos-conjuntos",
    subcategory: "jaquetas",
    brand: "prisma-sport",
    featured: true,
    sizes: CLOTHING_SIZES,
    colors: ["Preto", "Azul"],
  },
  {
    name: "Conjunto Moletom Duo",
    slug: "conjunto-moletom-duo",
    description: "Conjunto de moletom (blusa + calça) em algodão macio.",
    price: 219,
    category: "casacos-conjuntos",
    subcategory: "conjuntos",
    brand: "athos",
    sizes: CLOTHING_SIZES,
    colors: ["Preto", "Cinza"],
  },
  {
    name: "Boné Aba Curva",
    slug: "bone-aba-curva",
    description: "Boné de aba curva com fecho ajustável e bordado frontal.",
    price: 45,
    compareAtPrice: 60,
    category: "bones",
    subcategory: "aba-curva",
    brand: "nortik",
    sizes: ["Único"],
    colors: COLORS,
  },
  {
    name: "Boné Aba Reta Snapback",
    slug: "bone-aba-reta-snapback",
    description: "Boné aba reta estilo snapback, ajuste traseiro.",
    price: 55,
    category: "bones",
    subcategory: "aba-reta",
    brand: "vertik",
    sizes: ["Único"],
    colors: ["Preto", "Branco"],
  },
  {
    name: "Meia Cano Alto Kit 3",
    slug: "meia-cano-alto-kit-3",
    description: "Kit com 3 pares de meia cano alto, tecido com compressão leve.",
    price: 39,
    category: "acessorios",
    subcategory: "meias",
    brand: "prisma-sport",
    sizes: ["Único"],
    colors: ["Preto"],
  },
  {
    name: "Mochila Esportiva 30L",
    slug: "mochila-esportiva-30l",
    description: "Mochila esportiva com compartimento para tênis e bolso térmico.",
    price: 129,
    category: "acessorios",
    subcategory: "mochilas",
    brand: "vertik",
    sizes: ["Único"],
    colors: ["Preto", "Cinza"],
  },
  {
    name: "Garrafa Térmica 1L",
    slug: "garrafa-termica-1l",
    description: "Garrafa térmica de aço inox, mantém a temperatura por até 12h.",
    price: 59,
    category: "acessorios",
    subcategory: "garrafas",
    brand: "athos",
    sizes: ["Único"],
    colors: ["Preto", "Azul"],
  },
];

const BANNERS = [
  {
    title: "Performance esportiva pra treinar sem limite",
    subtitle: "nova coleção",
    ctaLabel: "ver coleção",
    ctaHref: "/categoria/camisetas",
    theme: "cyan",
    placement: "CARD" as const,
    position: 0,
  },
  {
    title: "Ofertas da semana",
    subtitle: "até 40% off",
    ctaLabel: "aproveitar",
    ctaHref: "/categoria/bermudas-shorts",
    theme: "red",
    placement: "CARD" as const,
    position: 1,
  },
  {
    title: "Linha inverno",
    subtitle: "recém-chegado",
    ctaLabel: "conferir",
    ctaHref: "/categoria/casacos-conjuntos",
    theme: "green",
    placement: "CARD" as const,
    position: 2,
  },
  {
    title: "Frete grátis acima de R$250",
    subtitle: "toda a loja",
    ctaLabel: "aproveitar",
    ctaHref: "/",
    theme: "cyan",
    placement: "CAROUSEL" as const,
    position: 0,
  },
];

async function main() {
  console.log("Seeding categorias...");
  for (const c of CATEGORIES) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  console.log("Seeding marcas...");
  for (const b of BRANDS) {
    await db.brand.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }

  console.log("Seeding subcategorias...");
  for (const s of SUBCATEGORIES) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: s.category } });
    await db.subcategory.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: s.slug } },
      update: { name: s.name },
      create: { name: s.name, slug: s.slug, categoryId: category.id },
    });
  }

  console.log("Seeding produtos...");
  for (const p of PRODUCTS) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: p.category } });
    const brand = await db.brand.findUniqueOrThrow({ where: { slug: p.brand } });
    const subcategory = p.subcategory
      ? await db.subcategory.findUniqueOrThrow({
          where: { categoryId_slug: { categoryId: category.id, slug: p.subcategory } },
        })
      : null;

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        featured: p.featured ?? false,
        categoryId: category.id,
        subcategoryId: subcategory?.id ?? null,
        brandId: brand.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        featured: p.featured ?? false,
        categoryId: category.id,
        subcategoryId: subcategory?.id ?? null,
        brandId: brand.id,
      },
    });

    for (const size of p.sizes) {
      for (const color of p.colors) {
        await db.productVariant.upsert({
          where: { productId_size_color: { productId: product.id, size, color } },
          update: {},
          create: { productId: product.id, size, color, stock: 20 },
        });
      }
    }
  }

  console.log("Seeding banners...");
  await db.banner.deleteMany({});
  await db.banner.createMany({ data: BANNERS });

  console.log("Seeding regra de frete grátis...");
  await db.freeShippingRule.deleteMany({});
  await db.freeShippingRule.create({
    data: {
      label: "Frete grátis acima de R$250",
      type: "MIN_VALUE",
      minValue: 250,
      active: true,
    },
  });

  console.log("Seeding usuário admin...");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? crypto.randomBytes(9).toString("base64url");
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      `Nenhuma SEED_ADMIN_PASSWORD definida no ambiente — senha gerada para o admin: ${adminPassword}`
    );
    console.log("Troque essa senha assim que fizer o primeiro login.");
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await db.user.upsert({
    where: { email: "admin@celostore.com.br" },
    update: {},
    create: {
      name: "Admin Celo Store",
      email: "admin@celostore.com.br",
      phone: "13974083160",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
