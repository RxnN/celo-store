const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export function isTurnstileConfigured() {
  return Boolean(SECRET_KEY);
}

export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  if (!SECRET_KEY) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET_KEY, response: token }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
