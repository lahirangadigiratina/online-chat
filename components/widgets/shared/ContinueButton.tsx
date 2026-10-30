interface Props {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}

export function ContinueButton({
  disabled,
  onClick,
  label = "Continue",
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:bg-neutral-200 disabled:text-neutral-400 enabled:bg-brand-orange enabled:hover:bg-[#d45a16]"
    >
      {label}
    </button>
  );
}
