/**
 * Proteção CSRF para Route Handlers (app/api/**).
 *
 * Server Actions do Next.js já validam a origem automaticamente — isso é só
 * necessário para rotas de API "cruas" que mutam dados usando a sessão via
 * cookie. Se o navegador manda Origin (que ele sempre manda em POST, cross-site
 * ou não), ela precisa bater com o host da própria requisição.
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get("host");
    return originHost === requestHost;
  } catch {
    return false;
  }
}
