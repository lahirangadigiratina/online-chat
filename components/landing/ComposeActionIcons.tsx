type IconKind = "send" | "track" | "dropoff" | "quote";

export function ComposeActionIcon({ kind }: { kind: IconKind }) {
  const cls = "h-5 w-5";
  switch (kind) {
    case "send":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8l8-4 8 4v8l-8 4-8-4V8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 4v16M4 8l8 4 8-4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "track":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "dropoff":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "quote":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 6h16M4 12h10M4 18h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export const COMPOSE_ICON_KINDS: IconKind[] = [
  "send",
  "track",
  "dropoff",
  "quote",
];
