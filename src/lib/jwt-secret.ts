export function getJwtSecret(): Uint8Array {
  const s = (
    process.env.JWT_SECRET?.trim() ||
    "dev-only-change-JWT_SECRET-in-production-min-32-chars"
  ).trim();
  return new TextEncoder().encode(s);
}
