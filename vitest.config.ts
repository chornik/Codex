import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";
process.env.XDG_CACHE_HOME ||= path.resolve("data/cache");
fs.mkdirSync(process.env.XDG_CACHE_HOME, { recursive: true });
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 60000,
  },
});
