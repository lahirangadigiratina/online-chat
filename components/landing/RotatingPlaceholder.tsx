"use client";

import { useEffect, useState } from "react";
const HOLD_MS = 3000;
const SCROLL_MS = 520;

interface Props {
  phrases: readonly string[];
  className?: string;
}

export function RotatingPlaceholder({ phrases, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const tick = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, HOLD_MS);

    return () => clearInterval(tick);
  }, [phrases.length]);

  if (phrases.length === 0) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none w-full select-none ${className}`}
    >
      <div
        className="relative overflow-hidden sm:[--line-h:1.375rem] [--line-h:1.25rem]"
        style={{ height: "var(--line-h)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-b from-white to-transparent sm:h-1" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 bg-gradient-to-t from-white to-transparent sm:h-1" />

        <div
          className="will-change-transform motion-reduce:transition-none"
          style={{
            transform: `translate3d(0, calc(-${index} * var(--line-h)), 0)`,
            transition: reduceMotion
              ? "none"
              : `transform ${SCROLL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {phrases.map((phrase, i) => (
            <p
              key={`${phrase}-${i}`}
              className="truncate text-sm leading-5 text-neutral-400 sm:text-[15px] sm:leading-[22px]"
              style={{
                height: "var(--line-h)",
                lineHeight: "var(--line-h)",
              }}
            >
              {phrase}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
