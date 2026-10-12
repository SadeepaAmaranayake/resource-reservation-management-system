import "server-only";

const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new () => {
    user: {
      findUnique(args: Record<string, unknown>): Promise<{
        id: string;
        role: "ADMIN" | "USER";
        passwordHash: string;
      } | null>;
      create(args: Record<string, unknown>): Promise<{ id: string; role: "ADMIN" | "USER" }>;
    };
    reservation: {
      findMany(args: Record<string, unknown>): Promise<Array<{
        id: string;
        startTime: Date;
        endTime: Date;
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        purpose: string;
        user: { name: string; email: string };
        resource: { name: string; category: string };
      }>>;
      updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
      findFirst(args: Record<string, unknown>): Promise<{ id: string } | null>;
      create(args: Record<string, unknown>): Promise<unknown>;
    };
    resource: {
      findMany(args: Record<string, unknown>): Promise<Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        status: "AVAILABLE" | "MAINTENANCE";
      }>>;
      findUnique(args: Record<string, unknown>): Promise<{ id: string; status: "AVAILABLE" | "MAINTENANCE" } | null>;
      create(args: Record<string, unknown>): Promise<unknown>;
      updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
    };
  };
};

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
