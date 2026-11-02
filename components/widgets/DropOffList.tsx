"use client";

import { useEffect, useState } from "react";
import type { DropOffPoint } from "@/lib/types";

const PAGE_SIZE = 3;

const COMPACT_VISIBLE = 3;

interface Props {
  suburb: string;
  onSelect: (point: DropOffPoint) => void;
  disabled?: boolean;
  selectedId?: string;
  page?: number;
  onPageCount?: (totalPages: number) => void;
  /** Show 3 cards + "Show more" instead of paginated header */
  compactExpand?: boolean;
}

export function DropOffList({
  suburb,
  onSelect,
  disabled,
  selectedId,
  page = 0,
  onPageCount,
  compactExpand,
}: Props) {
  const [points, setPoints] = useState<DropOffPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dropoff-points?suburb=${encodeURIComponent(suburb)}`)
      .then((r) => r.json())
      .then((d) => setPoints(d.points ?? []))
      .finally(() => setLoading(false));
  }, [suburb]);

  useEffect(() => {
    setExpanded(false);
  }, [suburb]);

  const totalPages = Math.max(1, Math.ceil(points.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = compactExpand
    ? expanded
      ? points
      : points.slice(0, COMPACT_VISIBLE)
    : points.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (!compactExpand) onPageCount?.(totalPages);
  }, [totalPages, onPageCount, compactExpand]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading nearby points…</p>;
  }

  return (
    <div className="space-y-2">
      {visible.map((p) => {
        const selected = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              selected
                ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            } disabled:opacity-60`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-black">{p.name}</p>
                <p className="mt-0.5 text-xs text-neutral-600">{p.address}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {p.distanceKm} km · {p.hours}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    p.open
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {p.open ? "Open" : "Closed"}
                </span>
                {selected && (
                  <span className="text-brand-orange" aria-hidden>
                    ✓
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
      {compactExpand && points.length > COMPACT_VISIBLE && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded-xl border border-dashed border-neutral-300 py-2 text-sm font-medium text-brand-orange hover:bg-orange-50/50"
        >
          Show more ({points.length - COMPACT_VISIBLE} more)
        </button>
      )}
    </div>
  );
}
