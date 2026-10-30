import { ChatWindow } from "@/components/chat/ChatWindow";

export default function Home() {
  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col bg-white md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl">
      <ChatWindow />
    </main>
  );
}
