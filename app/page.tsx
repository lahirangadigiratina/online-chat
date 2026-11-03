import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";

export default function Home() {
  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-[#F7F8FA] md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl">
      <WelcomeScreen />
    </main>
  );
}
