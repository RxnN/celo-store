import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger, getRequestId } from "@/lib/logger";
import { isEmailConfigured } from "@/lib/email";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { isMelhorEnvioConfigured } from "@/lib/melhor-envio";
import { isR2Configured } from "@/lib/storage";

export async function GET() {
  const start = performance.now();

  let database: { status: "ok" | "down"; latencyMs: number } = { status: "down", latencyMs: 0 };
  try {
    const dbStart = performance.now();
    await db.$queryRaw`SELECT 1`;
    database = { status: "ok", latencyMs: Math.round(performance.now() - dbStart) };
  } catch (err) {
    logger.error("health.database_check_failed", err);
  }

  const status = database.status === "ok" ? "ok" : "degraded";

  const body = {
    status,
    timestamp: new Date().toISOString(),
    requestId: await getRequestId(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    checks: {
      database,
      // Serviços com fallback gracioso: "configured: false" é esperado em
      // desenvolvimento/antes do go-live, não indica uma falha.
      email: { configured: isEmailConfigured() },
      mercadoPago: { configured: isMercadoPagoConfigured() },
      melhorEnvio: { configured: isMelhorEnvioConfigured() },
      r2Storage: { configured: isR2Configured() },
    },
    durationMs: Math.round(performance.now() - start),
  };

  return NextResponse.json(body, { status: status === "ok" ? 200 : 503 });
}
