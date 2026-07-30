import { headers } from "next/headers";

type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

export async function getRequestId(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    return headersList.get("x-request-id") ?? undefined;
  } catch {
    // headers() só funciona dentro do escopo de uma requisição (route
    // handler, server action, server component) — fora disso (ex.: script
    // standalone, extension do Prisma fora de uma requisição) retorna undefined.
    return undefined;
  }
}

async function write(level: Level, event: string, fields?: Fields, error?: unknown) {
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: await getRequestId(),
    ...fields,
  };

  if (error !== undefined) {
    payload.stack = error instanceof Error ? error.stack : String(error);
    if (error instanceof Error) payload.errorMessage = error.message;
  }

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

async function sendAlert(event: string, fields: Fields | undefined, error: unknown) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const message = error instanceof Error ? error.message : String(error);
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      message,
      requestId: await getRequestId(),
      timestamp: new Date().toISOString(),
      ...fields,
    }),
  }).catch(() => {
    // Alerta é best-effort — uma falha ao notificar não pode derrubar o
    // fluxo que originou o erro.
  });
}

export const logger = {
  info(event: string, fields?: Fields) {
    void write("info", event, fields);
  },
  warn(event: string, fields?: Fields) {
    void write("warn", event, fields);
  },
  error(event: string, error: unknown, fields?: Fields) {
    void write("error", event, fields, error);
    void sendAlert(event, fields, error);
  },
};
