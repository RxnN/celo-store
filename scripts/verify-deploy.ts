import { execSync } from "child_process";

type HealthResponse = { status: "ok" | "degraded"; checks?: Record<string, unknown> };

async function main() {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.error("Uso: npx tsx scripts/verify-deploy.ts https://celostore.vercel.app");
    process.exit(1);
  }

  const url = new URL("/api/health", baseUrl).toString();
  console.log(`Checando ${url}...`);

  let body: HealthResponse | null = null;
  try {
    const res = await fetch(url);
    body = await res.json();
  } catch (err) {
    console.error("Falha ao acessar o health check:", err);
  }

  if (body?.status === "ok") {
    console.log("Deploy saudável:", JSON.stringify(body.checks, null, 2));
    return;
  }

  console.error("Deploy NÃO saudável:", body ? JSON.stringify(body, null, 2) : "(sem resposta)");
  console.log("Tentando rollback para o deploy anterior via Vercel CLI...");

  try {
    execSync("npx vercel rollback --yes", { stdio: "inherit" });
    console.log("Rollback solicitado.");
  } catch (err) {
    console.error("Rollback automático falhou — reverta manualmente pelo painel da Vercel.", err);
    process.exit(1);
  }
}

main();
