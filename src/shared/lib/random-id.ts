/**
 * ID helper that never calls `crypto.randomUUID`.
 * That API is missing on non-secure origins (http://LAN-IP) and webpack
 * crypto polyfills can also expose a broken `randomUUID` binding.
 */
export function createRandomId(): string {
  const subtle =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (subtle && typeof subtle.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    subtle.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** @deprecated use createRandomId — kept so older imports keep working */
export function randomUUID(): string {
  return createRandomId();
}

export function prefixedId(prefix: string, separator = "-"): string {
  return `${prefix}${separator}${createRandomId()}`;
}
