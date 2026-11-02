interface Props {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}

const continueButtonClass =
  "inline-flex h-12 min-h-[48px] min-w-0 items-center justify-center rounded-full bg-ppg-orange px-6 text-base font-bold text-white transition-colors hover:bg-ppg-orange-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ppg-orange disabled:cursor-not-allowed disabled:bg-[#e8e8e8] disabled:text-[#9a9a9a] disabled:hover:bg-[#e8e8e8]";

export function ContinueButton({
  disabled,
  onClick,
  label = "Continue",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${continueButtonClass} mt-3 w-full ${className}`.trim()}
    >
      {label}
    </button>
  );
}
