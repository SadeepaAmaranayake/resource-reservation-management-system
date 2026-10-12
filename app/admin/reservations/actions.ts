"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ReviewActionState = { error?: string; success?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
}

async function setReservationStatus(formData: FormData, status: "APPROVED" | "REJECTED"): Promise<ReviewActionState> {
  await requireAdmin();
  const parsed = z.string().min(1).safeParse(formData.get("reservationId"));
  if (!parsed.success) return { error: "Invalid reservation." };

  try {
    const result = await prisma.reservation.updateMany({
      where: { id: parsed.data, status: "PENDING" },
      data: { status },
    });
    if (result.count === 0) {
      return { error: "This request is no longer pending. Refresh the page to see its current status." };
    }
  } catch {
    return { error: `Could not ${status === "APPROVED" ? "approve" : "reject"} this request. Check the database connection and try again.` };
  }

  revalidatePath("/admin/reservations");
  revalidatePath("/dashboard");
  return { success: status === "APPROVED" ? "Reservation approved." : "Reservation rejected." };
}

export async function approveReservation(_previous: ReviewActionState, formData: FormData) {
  return setReservationStatus(formData, "APPROVED");
}

export async function rejectReservation(_previous: ReviewActionState, formData: FormData) {
  return setReservationStatus(formData, "REJECTED");
}
