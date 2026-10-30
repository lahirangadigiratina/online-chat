"use client";

import { useCallback, useEffect, useState } from "react";

interface Props {
  onSelect: (suburb: string) => void;
  disabled?: boolean;
}

export function SuburbSearch({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/suburbs?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suburbs ?? []);
      setOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const pick = useCallback(
    (s: string) => {
      setQuery(s);
      setOpen(false);
      onSelect(s);
    },
    [onSelect]
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder="e.g. Bondi Junction"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:opacity-60"
      />
      {open && suggestions.length > 0 && !disabled && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
                onClick={() => pick(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.length >= 2 && !disabled && (
        <button
          type="button"
          onClick={() => pick(query)}
          className="mt-2 w-full rounded-xl bg-brand-orange py-2.5 text-sm font-medium text-white"
        >
          Use &quot;{query}&quot;
        </button>
      )}
    </div>
  );
}
