"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
}

export function BookingBarcode({ value }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        if (cancelled || !svgRef.current) return;
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.5,
          height: 48,
          displayValue: false,
          margin: 8,
        });
      } catch {
        /* jsbarcode optional until npm install */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <svg ref={svgRef} className="mx-auto max-w-full" role="img" aria-label={`Barcode ${value}`} />
  );
}
