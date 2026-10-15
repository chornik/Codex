import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import path from "node:path";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export function makeDb() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:"))
    throw new Error(
      "DATABASE_URL muss eine lokale SQLite-Datei mit file: angeben.",
    );
  const file = url.slice(5);
  const absoluteUrl = `file:${path.isAbsolute(file) ? file : path.resolve("prisma", file)}`;
  return new PrismaClient({ adapter: new PrismaLibSQL({ url: absoluteUrl }) });
}
export const db = globalDb.prisma ?? makeDb();
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
