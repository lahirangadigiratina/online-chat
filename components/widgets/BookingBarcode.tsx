"use client";

interface Props {
  value: string;
}

/** Mock barcode for demo — replace with jsbarcode or server-generated image in production */
export function BookingBarcode({ value }: Props) {
  const bars = value
    .split("")
    .flatMap((ch, i) => {
      const w = (ch.charCodeAt(0) % 3) + 1;
      return [
        { w, dark: i % 2 === 0 },
        { w: 1, dark: false },
      ];
    })
    .slice(0, 48);

  return (
    <div
      className="mx-auto flex max-w-full items-end justify-center gap-px px-2 py-3"
      role="img"
      aria-label={`Barcode ${value}`}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          className={bar.dark ? "bg-brand-black" : "bg-transparent"}
          style={{ width: bar.w, height: 48 }}
        />
      ))}
    </div>
  );
}
