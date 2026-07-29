/**
 * Limitador de taxa em memória do processo — os contadores não são
 * compartilhados entre instâncias. Reiniciar o processo zera tudo, e cada
 * instância rodando em paralelo tem seu próprio contador independente. Isso
 * é suficiente para um único processo (ex.: um servidor Node tradicional),
 * mas se a aplicação passar a rodar em múltiplas instâncias simultâneas
 * (ex.: várias funções serverless concorrentes), o limite efetivo multiplica
 * pelo número de instâncias. Nesse cenário, trocar por um store compartilhado
 * (ex.: Redis/Upstash) antes de depender disso pra bloquear abuso real.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}
