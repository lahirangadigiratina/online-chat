const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Normalize to digits-only AU mobile (61XXXXXXXXX) or null if invalid */
export function normalizeAuMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let normalized = digits;
  if (normalized.startsWith("0")) normalized = `61${normalized.slice(1)}`;
  if (normalized.startsWith("4") && normalized.length === 9) {
    normalized = `61${normalized}`;
  }
  if (!normalized.startsWith("61")) return null;
  const rest = normalized.slice(2);
  if (rest.length !== 9 || rest[0] !== "4") return null;
  return normalized;
}

export function formatAuMobileDisplay(normalized: string): string {
  const rest = normalized.startsWith("61") ? normalized.slice(2) : normalized;
  if (rest.length !== 9) return inputFallback(normalized);
  return `+61 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
}

function inputFallback(s: string): string {
  return s;
}

export const MAX_PARCEL_VALUE = 10_000;
