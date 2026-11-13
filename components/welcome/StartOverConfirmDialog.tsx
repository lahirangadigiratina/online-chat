"use client";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  accentOrange?: string;
}

export function StartOverConfirmDialog({
  open,
  onConfirm,
  onCancel,
  accentOrange = "#C44717",
}: Props) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#5F6877]/85 p-6"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="start-over-title"
        aria-describedby="start-over-description"
        className="w-full max-w-[20rem] overflow-hidden rounded-[1.35rem] bg-white px-5 py-5 text-left shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="start-over-title"
          className="text-[17px] font-semibold leading-snug text-[#0B1B32]"
        >
          Start over?
        </h2>
        <p
          id="start-over-description"
          className="mt-2 text-[14px] leading-snug text-neutral-600"
        >
          Are you sure you want to start over? If you continue, all the details
          and options you&apos;ve added so far will be cleared.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99]"
            style={{ backgroundColor: accentOrange }}
          >
            Yes, start over
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-full border border-neutral-200 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
          >
            No, keep going
          </button>
        </div>
      </div>
    </div>
  );
}
