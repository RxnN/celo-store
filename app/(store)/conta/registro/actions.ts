"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const RegisterSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo."),
  email: z.string().email("E-mail inválido."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11, "Informe um telefone válido (com DDD)."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const ip = getClientIp(await headers());
  const rateLimit = checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!rateLimit.ok) {
    return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const turnstileOk = await verifyTurnstileToken(formData.get("cfTurnstileToken") as string | null);
  if (!turnstileOk) {
    return { error: "Verificação de segurança falhou. Tente novamente." };
  }

  const { name, email, phone, password } = parsed.data;

  const existingEmail = await db.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const existingPhone = await db.user.findUnique({ where: { phone } });
  if (existingPhone) {
    return { error: "Já existe uma conta com esse telefone." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, email, phone, passwordHash, role: "CUSTOMER" } });

  return { success: true };
}
