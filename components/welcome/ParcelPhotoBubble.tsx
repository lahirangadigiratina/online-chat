export function ParcelPhotoBubble() {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] overflow-hidden rounded-[1.25rem] rounded-br-md bg-[#0B1B32] p-3 text-white">
        <div className="flex aspect-[4/3] w-full min-w-[11rem] items-center justify-center rounded-lg bg-[#C9A66B]">
          <svg
            width="56"
            height="48"
            viewBox="0 0 28 24"
            fill="none"
            aria-hidden
            className="text-white/95"
          >
            <path
              d="M4 7h16v12H4V7z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M4 7l8 4 8-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-white/90">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="shrink-0 opacity-90"
          >
            <path
              d="M4 8h4l2-2h4l2 2h4v11H4V8z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="13"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.75"
            />
          </svg>
          Parcel photo
        </div>
      </div>
    </div>
  );
}
