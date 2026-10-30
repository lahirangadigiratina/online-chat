"use client";

import { useEffect, useState } from "react";

interface Props {
  onSelect: (address: string) => void;
  disabled?: boolean;
}

export function AddressInput({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/addresses?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.addresses ?? []);
      setOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder="Street address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:opacity-60"
      />
      {open && suggestions.length > 0 && !disabled && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border bg-white shadow-lg">
          {suggestions.map((a) => (
            <li key={a}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  setQuery(a);
                  setOpen(false);
                  onSelect(a);
                }}
              >
                {a}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 5 && !disabled && (
        <button
          type="button"
          onClick={() => onSelect(query.trim())}
          className="mt-2 w-full rounded-xl bg-brand-orange py-2.5 text-sm font-medium text-white"
        >
          Continue with this address
        </button>
      )}
    </div>
  );
}
