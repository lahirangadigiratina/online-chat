"use client";

import Image from "next/image";

const ROBOT_W = 351;
const ROBOT_H = 441;

function HelloDialog() {
  return (
    <div
      className="welcome-hello-animate absolute right-[6%] top-[10%] z-10 sm:right-[4%] sm:top-[8%]"
      role="img"
      aria-label="Hello!"
    >
      <div className="relative rounded-2xl bg-white px-3.5 py-1.5 shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:px-4 sm:py-2">
        <p className="whitespace-nowrap text-sm font-medium text-neutral-600 sm:text-[15px]">
          Hello!
        </p>
        <span
          className="absolute -bottom-1.5 left-[62%] h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-white"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function WelcomeHero() {
  return (
    <div className="relative mx-auto h-full w-full">
      <HelloDialog />
      <div className="welcome-hero-animate w-full">
        <Image
          src="/welcome-robot.png"
          alt=""
          width={ROBOT_W}
          height={ROBOT_H}
          quality={100}
          priority
          unoptimized
          sizes="(max-width: 640px) 220px, 240px"
          className="h-auto w-full select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
