import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

export const proxy = auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 'strict-dynamic' propaga confiança: um script já autorizado pelo nonce
  // (nosso bundle) pode injetar outros scripts (ex: o widget do Turnstile)
  // sem precisar listar o domínio deles aqui. Em dev, o Turbopack ainda
  // precisa de 'unsafe-eval' pro HMR — isso não afeta o strict-dynamic.
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    // Atributos style inline (ex: cor dinâmica dos banners) exigem unsafe-inline —
    // nonce não cobre o atributo style="", só <style> blocks.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self' https://viacep.com.br https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    !isDev ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");

  function withSecurityHeaders(response: NextResponse) {
    response.headers.set("x-request-id", requestId);
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    if (!isDev) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }
    return response;
  }

  if (isAdminRoute && !isAdmin) {
    const loginUrl = new URL("/conta/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-request-id", requestId);

  return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|uploads).*)"],
};
