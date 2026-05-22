import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const JWT_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing AUTH_SECRET or NEXTAUTH_SECRET environment variable.");
}

const SECRET = JWT_SECRET;
const COOKIE_NAME = "govdesk_jwt";
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
};

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  callbackUrl: z.string().url().optional(),
});

function base64url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function signJwt(data: string) {
  return base64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

function verifySignature(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const expected = signJwt(`${header}.${payload}`);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

function decodeJwt(token: string): AuthUser | null {
  if (!verifySignature(token)) return null;
  const [, payload] = token.split(".");
  const decoded = JSON.parse(base64urlDecode(payload)) as AuthUser;
  if (!decoded || typeof decoded.exp !== "number") return null;
  if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeJwt(token);
}

export function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return decodeJwt(match[1]);
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    },
  });
  if (!user) return null;
  const passwordsMatch = await bcrypt.compare(password, user.password);
  console.log(passwordsMatch)
  if (!passwordsMatch) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function createAuthToken(user: { id: string; email: string; name: string; role: string }) {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ sub: user.id, email: user.email, name: user.name, role: user.role, exp }));
  return `${header}.${payload}.${signJwt(`${header}.${payload}`)}`;
}

export function getAuthCookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE};${secure ? " Secure;" : ""}`;
}

export function clearAuthCookieHeader() {
  const secure = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;${secure ? " Secure;" : ""}`;
}

export { credentialSchema };
