import { createHash, timingSafeEqual } from "node:crypto";
export type DemoAccess = "open" | "allowed" | "denied" | "unconfigured";
export function demoAccess(
  authorization: string | null,
  env: Record<string, string | undefined> = process.env,
): DemoAccess {
  const required = env.DEMO_AUTH_REQUIRED === "1" || env.RENDER === "true";
  if (!required) return "open";
  const user = env.DEMO_USERNAME || "demo";
  const password = env.DEMO_PASSWORD;
  if (
    !password ||
    password.length < 24 ||
    password.length > 1024 ||
    !user ||
    user.includes(":") ||
    user.length > 64
  )
    return "unconfigured";
  if (!authorization || authorization.length > 4096) return "denied";
  const match = authorization.match(/^Basic ([a-z0-9+/]+={0,2})$/i);
  if (!match) return "denied";
  const actual = Buffer.from(match[1], "base64");
  const expected = Buffer.from(`${user}:${password}`, "utf8");
  const hash = (value: Buffer) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(actual), hash(expected)) ? "allowed" : "denied";
}
