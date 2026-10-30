interface Props {
  className?: string;
  size?: "lg" | "sm";
}

export function ParcelPointLogo({ className = "", size = "lg" }: Props) {
  const text =
    size === "lg"
      ? "text-lg tracking-tight sm:text-xl"
      : "text-xs tracking-tight sm:text-sm";

  return (
    <div className={`font-bold ${className}`} aria-label="ParcelPoint Go">
      <span className={`${text} text-brand-black`}>PARCELPOINT </span>
      <span className={`${text} text-brand-orange`}>GO</span>
    </div>
  );
}
