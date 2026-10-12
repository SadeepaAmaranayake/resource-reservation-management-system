"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ResourceActionState = { error?: string; success?: string };

const resourceFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  category: z.string().trim().min(2, "Category is required.").max(80),
  description: z.string().trim().min(5, "Description must be at least 5 characters.").max(1000),
};

const createSchema = z.object(resourceFields);
const updateSchema = z.object({
  id: z.string().min(1),
  ...resourceFields,
  status: z.enum(["AVAILABLE", "MAINTENANCE"]),
});
const idSchema = z.string().min(1);

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createResource(
  _previous: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  await requireAdmin();
  const parsed = createSchema.safeParse({
    name: readText(formData, "name"),
    category: readText(formData, "category"),
    description: readText(formData, "description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the resource details." };

  try {
    await prisma.resource.create({ data: parsed.data });
  } catch {
    return { error: "Could not add the resource. Check the database connection and try again." };
  }

  revalidatePath("/admin/resources");
  return { success: "Resource added." };
}

export async function updateResource(
  _previous: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: readText(formData, "id"),
    name: readText(formData, "name"),
    category: readText(formData, "category"),
    description: readText(formData, "description"),
    status: readText(formData, "status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the resource details." };

  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.resource.updateMany({ where: { id }, data });
    if (result.count === 0) return { error: "That resource no longer exists. Refresh the page." };
  } catch {
    return { error: "Could not update the resource. Check the database connection and try again." };
  }

  revalidatePath("/admin/resources");
  return { success: "Resource updated." };
}

export async function deactivateResource(
  _previous: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  await requireAdmin();
  const parsed = idSchema.safeParse(readText(formData, "id"));
  if (!parsed.success) return { error: "Invalid resource." };

  try {
    const result = await prisma.resource.updateMany({
      where: { id: parsed.data },
      data: { status: "MAINTENANCE" },
    });
    if (result.count === 0) return { error: "That resource no longer exists. Refresh the page." };
  } catch {
    return { error: "Could not deactivate the resource. Check the database connection and try again." };
  }

  revalidatePath("/admin/resources");
  return { success: "Resource marked as maintenance." };
}
