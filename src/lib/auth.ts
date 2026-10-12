import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is not configured");

const key = new TextEncoder().encode(secret);
const cookieName = "session";

export type SessionUser = {
  id: string;
  role: "ADMIN" | "USER";
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key);
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "USER")
    ) {
      return null;
    }

    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}