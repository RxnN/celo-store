"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { logger } from "@/lib/logger";

export type ForgotPasswordState = { error?: string; resetUrl?: string; emailSent?: boolean };

const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  if (!identifier) return { error: "Informe seu e-mail ou telefone." };

  const turnstileOk = await verifyTurnstileToken(formData.get("cfTurnstileToken") as string | null);
  if (!turnstileOk) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }

  const ip = getClientIp(await headers());
  const rateLimit = checkRateLimit(
    `forgot-password:${ip}:${identifier.toLowerCase()}`,
    5,
    15 * 60 * 1000
  );
  if (!rateLimit.ok) {
    return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const isEmail = identifier.includes("@");
  const user = isEmail
    ? await db.user.findUnique({ where: { email: identifier.toLowerCase() } })
    : await db.user.findUnique({ where: { phone: identifier.replace(/\D/g, "") } });

  // A resposta é sempre a mesma, exista ou não a conta — evita revelar quais
  // e-mails/telefones estão cadastrados (enumeração de usuários).
  if (!user) {
    return { emailSent: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetPath = `/conta/redefinir-senha?token=${token}`;

  if (isEmailConfigured()) {
    await sendPasswordResetEmail(user.email, `${baseUrl}${resetPath}`).catch((err) => {
      logger.error("password_reset.email_send_failed", err, { userId: user.id });
    });
    return { emailSent: true };
  }

  // Ambiente de testes sem serviço de e-mail configurado: mostra o link direto.
  return { resetUrl: resetPath };
}
