import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Celo Store <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Redefinir sua senha — Celo Store",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 4px;">Redefinir sua senha</h2>
        <p>Recebemos um pedido pra redefinir a senha da sua conta na Celo Store.</p>
        <p style="margin: 24px 0;">
          <a
            href="${resetUrl}"
            style="display:inline-block;background:#4d8dff;color:#04173a;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;"
          >
            Redefinir senha
          </a>
        </p>
        <p style="color:#666; font-size:13px;">
          Se você não pediu essa redefinição, pode ignorar este e-mail. O link expira em 30 minutos.
        </p>
      </div>
    `,
  });

  return !error;
}
