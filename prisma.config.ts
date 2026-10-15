import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import path from "node:path";
const file = (process.env.DATABASE_URL || "file:./dev.db").slice(5);
export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: { adapter: true },
  engine: "js",
  adapter: async () =>
    new PrismaLibSQL({ url: `file:${path.resolve("prisma", file)}` }),
});
