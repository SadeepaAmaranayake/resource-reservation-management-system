import { defineConfig } from "prisma/config";
import "dotenv/config";

// Use Supabase's session pooler for Prisma CLI operations such as migrations.
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DIRECT_URL or DATABASE_URL is missing. Add your Supabase PostgreSQL connection string to the project-root .env file.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
