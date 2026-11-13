"use client";

import Image from "next/image";

export function PpGoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 overflow-hidden rounded-full bg-[#0B1B32] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/ppgo-mark.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
