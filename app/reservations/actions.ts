"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ReservationActionState = { error?: string; success?: string };

const bookingSchema = z.object({
  resourceId: z.string().min(1, "Choose a resource."),
  startTime: z.string().datetime({ local: true }),
  endTime: z.string().datetime({ local: true }),
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters.").max(500),
}).refine((values) => new Date(values.startTime) > new Date(), {
  path: ["startTime"],
  message: "Start time must be in the future.",
}).refine((values) => new Date(values.endTime) > new Date(values.startTime), {
  path: ["endTime"],
  message: "End time must be after the start time.",
});

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createReservation(
  _previous: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/admin/resources");

  const parsed = bookingSchema.safeParse({
    resourceId: readText(formData, "resourceId"),
    startTime: readText(formData, "startTime"),
    endTime: readText(formData, "endTime"),
    purpose: readText(formData, "purpose"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your booking details." };
  }

  const startTime = new Date(parsed.data.startTime);
  const endTime = new Date(parsed.data.endTime);

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parsed.data.resourceId },
      select: { id: true, status: true },
    });
    if (!resource) return { error: "That resource does not exist. Refresh and choose another." };
    if (resource.status !== "AVAILABLE") return { error: "That resource is currently unavailable." };

    // Half-open interval overlap: existing.start < requested.end && existing.end > requested.start.
    const conflict = await prisma.reservation.findFirst({
      where: {
        resourceId: resource.id,
        status: { in: ["PENDING", "APPROVED"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });
    if (conflict) {
      return { error: "This resource already has a pending or approved reservation during that time. Choose another time slot." };
    }

    await prisma.reservation.create({
      data: {
        userId: session.id,
        resourceId: resource.id,
        startTime,
        endTime,
        purpose: parsed.data.purpose,
      },
    });
  } catch {
    return { error: "Could not create the reservation. Check the database connection and try again." };
  }

  revalidatePath("/reservations");
  revalidatePath("/dashboard");
  return { success: "Reservation request submitted. It is pending approval." };
}
