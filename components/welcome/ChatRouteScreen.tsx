"use client";

import { useEffect, useState } from "react";
import { ChatParcelScreen } from "./ChatParcelScreen";
import { BookingConfirmedInStoreScreen } from "./BookingConfirmedInStoreScreen";
import { BookingConfirmedScreen } from "./BookingConfirmedScreen";
import { ChatBookingReviewScreen } from "./ChatBookingReviewScreen";
import { ChatPayConfirmScreen } from "./ChatPayConfirmScreen";
import { ChatPayScreen } from "./ChatPayScreen";
import { ChatPriceScreen } from "./ChatPriceScreen";
import { ChatReceiverConfirmScreen } from "./ChatReceiverConfirmScreen";
import { RouteMapScreen } from "./RouteMapScreen";
import {
  buildRouteThreadThroughParcelPoints,
  buildRouteToParcelThread,
  type ChatMessage,
  withParcelIntro,
} from "./chatThread";

type RoutePhase =
  | "route"
  | "map"
  | "receiver"
  | "parcel"
  | "price"
  | "pay"
  | "review"
  | "payConfirm"
  | "booked"
  | "bookedInStore";

interface Props {
  onBack: () => void;
  onFinished?: () => void;
  initialPhase?: RoutePhase;
  initialThread?: ChatMessage[];
}

const RECEIVER_PROMPT =
  "Church St Newsagent it is. Who\u2019s receiving it? Tell me their name, mobile and address.";

function threadOpeningAtReceiver(current: ChatMessage[]): ChatMessage[] {
  if (current.some((entry) => entry.id === "route-receiver-prompt")) {
    return current.filter((entry) => entry.id !== "route-parcelpoints");
  }
  const withoutPicker = current.filter(
    (entry) => entry.id !== "route-parcelpoints",
  );
  const base =
    withoutPicker.length > 0
      ? withoutPicker
      : buildRouteThreadThroughParcelPoints().filter(
          (entry) => entry.id !== "route-parcelpoints",
        );
  return [
    ...base,
    {
      id: "route-receiver-prompt",
      role: "bot",
      content: RECEIVER_PROMPT,
    },
  ];
}

export function ChatRouteScreen({
  onBack,
  onFinished,
  initialPhase = "route",
  initialThread = [],
}: Props) {
  const [phase, setPhase] = useState<RoutePhase>(
    initialPhase === "route" ? "receiver" : initialPhase,
  );
  const [thread, setThread] = useState<ChatMessage[]>(() =>
    initialPhase === "route"
      ? threadOpeningAtReceiver(initialThread)
      : initialThread,
  );
  const [payFixFromReview, setPayFixFromReview] = useState(false);
  const [receiverReturnsToReview, setReceiverReturnsToReview] = useState(false);

  useEffect(() => {
    if (initialThread.length > 0) {
      setThread(initialThread);
    }
  }, [initialThread]);

  const appendThread = (messages: ChatMessage[]) => {
    setThread((current) => [...current, ...messages]);
  };

  const upsertPaySender = (messages: ChatMessage[]) => {
    if (!messages.length) return;
    setThread((current) => [
      ...current.filter((entry) => entry.id !== "pay-sender-user"),
      ...messages,
    ]);
  };

  const goToReceiver = () => {
    setThread((current) => {
      const base =
        current.length > 0
          ? current
          : buildRouteThreadThroughParcelPoints();
      if (base.some((entry) => entry.id === "route-receiver-prompt")) {
        return base;
      }
      return [
        ...base,
        {
          id: "route-receiver-prompt",
          role: "bot",
          content: RECEIVER_PROMPT,
        },
      ];
    });
    setPhase("receiver");
  };

  if (phase === "bookedInStore") {
    return (
      <BookingConfirmedInStoreScreen
        priorThread={thread}
        onClose={() => onFinished?.()}
        onSendAnother={() => onFinished?.()}
      />
    );
  }

  if (phase === "booked") {
    return (
      <BookingConfirmedScreen
        priorThread={thread}
        onClose={() => onFinished?.()}
        onSendAnother={() => onFinished?.()}
      />
    );
  }

  if (phase === "payConfirm") {
    return (
      <ChatPayConfirmScreen
        priorThread={thread}
        onBack={() => setPhase("review")}
        onBooked={() => setPhase("booked")}
        onBookedInStore={() => setPhase("bookedInStore")}
      />
    );
  }

  if (phase === "review") {
    return (
      <ChatBookingReviewScreen
        priorThread={thread}
        onBack={() => setPhase("pay")}
        onContinueToPayment={() => setPhase("payConfirm")}
        onEditSection={(section) => {
          if (section === "from") {
            setPayFixFromReview(true);
            setPhase("pay");
            return;
          }
          if (section === "to") {
            setReceiverReturnsToReview(true);
            setPhase("receiver");
            return;
          }
          if (section === "parcel") {
            setPhase("parcel");
            return;
          }
          if (section === "delivery") {
            setPhase("price");
          }
        }}
      />
    );
  }

  if (phase === "pay") {
    return (
      <ChatPayScreen
        priorThread={thread}
        openInEditMode={payFixFromReview}
        returnToReview={payFixFromReview}
        onBack={() => {
          if (payFixFromReview) {
            setPayFixFromReview(false);
            setPhase("review");
            return;
          }
          setPhase("price");
        }}
        onLooksRight={(append) => {
          if (append?.length) upsertPaySender(append);
          setPayFixFromReview(false);
          setPhase("review");
        }}
      />
    );
  }

  if (phase === "price") {
    return (
      <ChatPriceScreen
        priorThread={thread}
        onBack={() => setPhase("parcel")}
        onContinue={(append) => {
          if (append?.length) appendThread(append);
          setPhase("pay");
        }}
      />
    );
  }

  if (phase === "parcel") {
    return (
      <ChatParcelScreen
        priorThread={thread}
        onBack={() => setPhase("receiver")}
        onContinue={(append) => {
          if (append?.length) appendThread(append);
          setPhase("price");
        }}
      />
    );
  }

  if (phase === "receiver") {
    return (
      <ChatReceiverConfirmScreen
        priorThread={thread}
        onBack={() => {
          if (receiverReturnsToReview) {
            setReceiverReturnsToReview(false);
            setPhase("review");
            return;
          }
          onBack();
        }}
        onLooksRight={() => {
          if (receiverReturnsToReview) {
            setReceiverReturnsToReview(false);
            setPhase("review");
            return;
          }
          setThread(withParcelIntro(buildRouteToParcelThread()));
          setPhase("parcel");
        }}
      />
    );
  }

  if (phase === "map") {
    return (
      <RouteMapScreen
        onBack={onBack}
        onDropOff={goToReceiver}
      />
    );
  }

  return null;
}
