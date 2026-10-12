"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DashboardActionState = { error?: string; success?: string };

export async function cancelReservation(
  _previous: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/admin/reservations");

  const parsed = z.string().min(1).safeParse(formData.get("reservationId"));
  if (!parsed.success) return { error: "Invalid reservation." };

  try {
    const result = await prisma.reservation.updateMany({
      where: {
        id: parsed.data,
        userId: session.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
      data: { status: "CANCELLED" },
    });
    if (result.count === 0) {
      return { error: "This reservation cannot be cancelled. It may already be completed or cancelled." };
    }
  } catch {
    return { error: "Could not cancel the reservation. Check the database connection and try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/reservations");
  return { success: "Reservation cancelled." };
}
