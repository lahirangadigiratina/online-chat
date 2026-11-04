const STORAGE_KEY = "ppg-recent-receiver-addresses";

function readStoredAddresses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function getRecentReceiverAddresses(): string[] {
  return readStoredAddresses();
}

export function saveRecentReceiverAddress(address: string): void {
  if (typeof window === "undefined") return;
  const trimmed = address.trim();
  if (!trimmed) return;
  const existing = readStoredAddresses().filter((item) => item !== trimmed);
  const next = [trimmed, ...existing].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
