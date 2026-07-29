import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { verifyTurnstileToken } from "./turnstile";
import { checkRateLimit } from "./rate-limit";
import { getClientIp } from "./request-ip";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/conta/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "E-mail ou telefone" },
        password: { label: "Senha", type: "password" },
        turnstileToken: { label: "Turnstile token" },
      },
      authorize: async (credentials, request) => {
        const identifier = (credentials?.identifier as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        const turnstileOk = await verifyTurnstileToken(
          credentials?.turnstileToken as string | undefined
        );
        if (!turnstileOk) return null;

        const ip = getClientIp(request.headers);
        const rateLimit = checkRateLimit(`login:${ip}:${identifier.toLowerCase()}`, 5, 5 * 60 * 1000);
        if (!rateLimit.ok) return null;

        const isEmail = identifier.includes("@");
        const user = isEmail
          ? await db.user.findUnique({ where: { email: identifier.toLowerCase() } })
          : await db.user.findUnique({ where: { phone: identifier.replace(/\D/g, "") } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
