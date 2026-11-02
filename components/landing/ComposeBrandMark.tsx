import Image from "next/image";

const BRAND = "/parcelpoint-compose-brand-transparent.png?v=2";

export function ComposeBrandMark() {
  return (
    <div
      className="compose-brand-mark flex max-w-full justify-center px-1"
      aria-label="ParcelPoint Go"
    >
      <Image
        src={BRAND}
        alt=""
        width={1024}
        height={252}
        priority
        unoptimized
        className="h-12 w-auto max-w-[min(20rem,92vw)] bg-transparent object-contain object-center sm:h-[3.25rem]"
      />
    </div>
  );
}
