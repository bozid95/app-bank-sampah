import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { AstroCookies } from "astro";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "bs_session";
const SESSION_DAYS = 7;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const hashPassword = (pw: string, rounds = 12) =>
  bcrypt.hash(pw, rounds);
export const verifyPassword = (pw: string, hash: string) =>
  bcrypt.compare(pw, hash);

export const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

export function isSecureRequest(request: Request): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return (
    new URL(request.url).protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function createSession(
  userId: number,
  cookies: AstroCookies,
  secure: boolean,
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({
    data: { id: sha256(token), userId, expiresAt },
  });
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  });
}

export async function getUserFromCookies(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: sha256(token) },
    include: {
      user: {
        select: { id: true, username: true, role: true, customerId: true },
      },
    },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function destroySession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: sha256(token) } });
  }
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;

export async function loginBlocked(key: string): Promise<boolean> {
  if (!key) return false;
  const attempt = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!attempt) return false;
  if (attempt.resetAt < new Date()) {
    await prisma.loginAttempt.delete({ where: { key } }).catch(() => {});
    return false;
  }
  return attempt.count >= MAX_ATTEMPTS;
}

export async function recordLoginFailure(key: string) {
  if (!key) return;
  const now = new Date();
  const nextReset = new Date(now.getTime() + WINDOW_MS);
  const existing = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!existing || existing.resetAt < now) {
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, count: 1, resetAt: nextReset },
      update: { count: 1, resetAt: nextReset },
    });
  } else {
    await prisma.loginAttempt.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  }
}

export async function clearLoginFailures(key: string) {
  if (!key) return;
  await prisma.loginAttempt.deleteMany({ where: { key } });
}

export async function destroyOtherSessions(
  userId: number,
  cookies: AstroCookies,
) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: { userId, ...(token ? { NOT: { id: sha256(token) } } : {}) },
  });
}
