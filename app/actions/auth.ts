"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

export type AuthState = { error?: string };

export async function signup(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Please check your details and try again." };

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) return { error: "Unable to create an account with those details." };

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
      select: { id: true, role: true },
    });

    await createSession(user);
  } catch {
    return { error: "Signup failed. Please try again." };
  }

  redirect("/dashboard");
}

export async function login(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Invalid email or password." };

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true, role: true },
    });

    const valid = user
      ? await bcrypt.compare(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !valid) return { error: "Invalid email or password." };

    await createSession({ id: user.id, role: user.role });
  } catch {
    return { error: "Login failed. Please try again." };
  }

  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
