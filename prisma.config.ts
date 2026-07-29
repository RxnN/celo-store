import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    // Opcional de propósito: só é usada por "prisma migrate", que não roda
    // no build (usamos "prisma db push" manualmente). Usar process.env
    // direto em vez de env() evita quebrar o build quando ela não existe.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
