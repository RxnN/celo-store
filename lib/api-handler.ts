import { NextResponse } from "next/server";
import { logger, getRequestId } from "@/lib/logger";

type RouteHandler<Args extends unknown[]> = (request: Request, ...args: Args) => Promise<Response>;

function memoryMb() {
  return Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;
}

/**
 * Envolve um route handler com logging estruturado (request/response,
 * duração, memória, CPU) e captura qualquer erro não tratado, garantindo
 * stack trace completo no log e uma resposta JSON consistente (em vez da
 * página de erro genérica do Next.js).
 */
export function withApiLogging<Args extends unknown[]>(
  handler: RouteHandler<Args>
): RouteHandler<Args> {
  return async (request: Request, ...args: Args) => {
    const start = performance.now();
    const cpuStart = process.cpuUsage();
    const method = request.method;
    const path = new URL(request.url).pathname;

    try {
      const response = await handler(request, ...args);
      const cpuDelta = process.cpuUsage(cpuStart);

      logger.info("api.request", {
        method,
        path,
        status: response.status,
        durationMs: Math.round(performance.now() - start),
        memoryMb: memoryMb(),
        cpuMs: Math.round((cpuDelta.user + cpuDelta.system) / 1000),
      });

      return response;
    } catch (err) {
      const cpuDelta = process.cpuUsage(cpuStart);

      logger.error("api.error", err, {
        method,
        path,
        durationMs: Math.round(performance.now() - start),
        memoryMb: memoryMb(),
        cpuMs: Math.round((cpuDelta.user + cpuDelta.system) / 1000),
      });

      return NextResponse.json(
        { error: "Erro interno do servidor.", requestId: await getRequestId() },
        { status: 500 }
      );
    }
  };
}
