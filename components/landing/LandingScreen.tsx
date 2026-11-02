"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/store";
import { ComposeLanding } from "./ComposeLanding";
import { WelcomeScreen } from "./WelcomeScreen";

export function LandingScreen() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const landingReady = useChatStore((s) => s.landingReady);
  const beginChat = useChatStore((s) => s.beginChat);
  const beginChatFromComposeOption = useChatStore(
    (s) => s.beginChatFromComposeOption
  );

  if (!landingReady) {
    return (
      <div className="h-full min-h-0">
        <WelcomeScreen />
      </div>
    );
  }

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await beginChat(trimmed);
      setText("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ComposeLanding
      busy={busy}
      text={text}
      onTextChange={setText}
      onSubmit={(value) => void submit(value)}
      onSelectOption={(option) => {
        if (busy) return;
        setBusy(true);
        void beginChatFromComposeOption(option).finally(() => setBusy(false));
      }}
    />
  );
}
