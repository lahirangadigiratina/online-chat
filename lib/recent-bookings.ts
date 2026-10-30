const STORAGE_KEY = "ppgo_recent_receiver_addresses";
const MAX = 3;

export function getRecentReceiverAddresses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveRecentReceiverAddress(address: string) {
  if (typeof window === "undefined" || !address.trim()) return;
  const existing = getRecentReceiverAddresses().filter((a) => a !== address);
  const next = [address, ...existing].slice(0, MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function hasPreviousBookings(): boolean {
  return getRecentReceiverAddresses().length > 0;
}
