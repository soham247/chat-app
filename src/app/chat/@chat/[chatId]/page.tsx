"use client";

import { useQuery, useMutation } from "convex/react";
import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MessageSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const router = useRouter();

  const conversationId = chatId as Id<"conversations">;

  const me = useQuery(api.users.current);
  const conversation = useQuery(api.conversations.getConversation, { conversationId });
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });
  const markRead = useMutation(api.messages.markRead);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessagesWhileScrolled, setNewMessagesWhileScrolled] = useState(false);
  const prevMessageCount = useRef(0);
  const isAtBottom = useRef(true);

  // Mark read when conversation opens
  useEffect(() => {
    if (conversationId) {
      markRead({ conversationId }).catch(() => {});
    }
  }, [conversationId, markRead]);

  // Mark read when new messages arrive
  useEffect(() => {
    if (messages && conversationId && isAtBottom.current) {
      markRead({ conversationId }).catch(() => {});
    }
  }, [messages?.length, conversationId, markRead]);

  // Scroll handling
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setShowScrollButton(false);
    setNewMessagesWhileScrolled(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isAtBottom.current = distanceFromBottom < 80;
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const count = messages?.length ?? 0;
    if (count > prevMessageCount.current) {
      if (isAtBottom.current) {
        scrollToBottom(prevMessageCount.current === 0);
        if (conversationId) markRead({ conversationId }).catch(() => {});
      } else if (prevMessageCount.current > 0) {
        setNewMessagesWhileScrolled(true);
      }
    }
    prevMessageCount.current = count;
  }, [messages?.length, scrollToBottom, conversationId, markRead]);

  // Initial scroll on load
  useEffect(() => {
    if (messages !== undefined && prevMessageCount.current === 0) {
      scrollToBottom(false);
    }
  }, [messages, scrollToBottom]);

  if (!me) return null;

  // Loading state
  if (conversation === undefined || messages === undefined) {
    return (
      <div className="h-screen flex flex-col bg-primary">
        <div className="h-[65px] bg-secondary border-b border-border-primary skeleton" />
        <div className="flex-1 p-4 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MessageSkeleton key={i} isOwn={i % 3 === 0} />
          ))}
        </div>
        <div className="h-[72px] bg-secondary border-t border-border-primary" />
      </div>
    );
  }

  // Not found / no access
  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary">
        <EmptyState
          icon="🔒"
          title="Conversation not found"
          description="This conversation doesn't exist or you don't have access."
          action={
            <button
              onClick={() => router.push("/chat")}
              className="px-6 py-2.5 rounded-full bg-accent-primary text-white border-none cursor-pointer font-semibold text-sm"
            >
              Go Back
            </button>
          }
        />
      </div>
    );
  }

  const typingNames = (typingUsers ?? []).filter((u): u is NonNullable<typeof u> => u !== null).map((u) => u.name);

  // Group consecutive messages from same sender
  const groupedMessages = messages.map((msg: typeof messages[number], i: number) => {
    const prev = messages[i - 1];
    const showAvatar = !prev || prev.senderId !== msg.senderId;
    return { ...msg, showAvatar };
  });

  return (
    <div className="flex flex-col h-screen bg-primary relative">
      {/* Header */}
      <ChatHeader
        conversation={conversation as Parameters<typeof ChatHeader>[0]["conversation"]}
        currentUserId={me._id}
        onBack={() => router.push("/chat")}
      />

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pt-3 pb-2 flex flex-col"
      >
        {messages.length === 0 ? (
          <EmptyState
            icon="👋"
            title="Start the conversation"
            description="Be the first to send a message!"
          />
        ) : (
          <>
            {groupedMessages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                currentUserId={me._id}
                showAvatar={msg.showAvatar}
              />
            ))}
          </>
        )}

        {/* Typing indicator */}
        <TypingIndicator names={typingNames} />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-[1px]" />
      </div>

      {/* "New messages" scroll button */}
      {showScrollButton && (
        <button
          className="animate-fade-in absolute bottom-[90px] left-1/2 -translate-x-1/2 py-2 px-5 rounded-full bg-accent-primary border-none text-white text-[0.8rem] font-semibold cursor-pointer shadow-[0_4px_16px_rgba(91,127,255,0.4)] flex items-center gap-1.5 z-10"
          onClick={() => {
            scrollToBottom();
            markRead({ conversationId }).catch(() => {});
          }}
        >
          ↓ {newMessagesWhileScrolled ? "New messages" : "Scroll to bottom"}
        </button>
      )}

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}