"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
}

interface Reaction {
  emoji: string;
  userIds: Id<"users">[];
}

interface Message {
  _id: Id<"messages">;
  content: string;
  isDeleted: boolean;
  senderId: Id<"users">;
  reactions: Reaction[];
  _creationTime: number;
  sender?: User | null;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: Id<"users">;
  showAvatar?: boolean;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return time;
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + time;
  }
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) + ", " + time;
}

export function MessageBubble({ message, currentUserId, showAvatar = true }: MessageBubbleProps) {
  const isOwn = message.senderId === currentUserId;
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const addReaction = useMutation(api.messages.addReaction);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const handleReaction = async (emoji: string) => {
    setShowReactions(false);
    await addReaction({ messageId: message._id, emoji });
  };

  const handleDelete = async () => {
    setShowDeleteMenu(false);
    await deleteMessage({ messageId: message._id });
  };

  return (
    <div
      className={`animate-slide-in flex items-end gap-2 px-4 py-0.5 relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseLeave={() => {
        setShowReactions(false);
        setShowDeleteMenu(false);
      }}
    >
      {/* Avatar (other user) */}
      {!isOwn && (
        <div className="shrink-0 w-8">
          {showAvatar && (
            message.sender?.imageUrl ? (
              <img
                src={message.sender.imageUrl}
                alt={message.sender.name}
                className="w-8 h-8 rounded-xl object-cover border border-border-subtle"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-text-primary flex items-center justify-center text-xs font-semibold text-bg-card">
                {message.sender?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )
          )}
        </div>
      )}

      {/* Bubble + Reactions */}
      <div className={`flex flex-col max-w-[68%] gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name (others in group) */}
        {!isOwn && showAvatar && message.sender && (
          <span className="text-[0.72rem] text-text-muted pl-0.5">
            {message.sender.name}
          </span>
        )}

        {/* Bubble */}
        <div className="relative flex items-center gap-1.5">
          {/* Hover action buttons */}
          {!message.isDeleted && (
            <div
              className={`flex gap-1 transition-opacity duration-150 ${showReactions || showDeleteMenu ? 'opacity-100' : 'opacity-0'} ${isOwn ? 'order-[-1]' : 'order-1'}`}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => {}}
            >
              {/* Reaction trigger */}
              <button
                onClick={() => setShowReactions((v) => !v)}
                className="w-7 h-7 rounded-full bg-card border border-border-primary cursor-pointer text-xs flex items-center justify-center"
                title="React"
              >
                😊
              </button>
              {/* Delete (own only) */}
              {isOwn && (
                <button
                  onClick={() => setShowDeleteMenu((v) => !v)}
                  className="w-7 h-7 rounded-full bg-card border border-border-primary cursor-pointer flex items-center justify-center"
                  title="Delete"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--error-red)" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div
            onMouseEnter={() => !message.isDeleted && setShowReactions(true)}
            className={`shadow-sm text-[0.9rem] leading-relaxed break-words px-3.5 ` + 
              (message.isDeleted 
                ? "py-2 bg-tertiary border border-border-primary text-text-muted italic rounded-xl" 
                : (isOwn 
                  ? "py-2.5 bg-accent-primary border-none text-white not-italic rounded-xl rounded-br-sm" 
                  : "py-2.5 bg-card border border-border-subtle text-text-primary not-italic rounded-xl rounded-bl-sm"))
            }
          >
            {message.isDeleted ? "This message was deleted" : message.content}
          </div>
        </div>

        {/* Reaction picker popup */}
        {showReactions && !message.isDeleted && (
          <div className={`animate-fade-in flex gap-1 py-1.5 px-2 bg-card border border-border-primary rounded-full shadow-md ${isOwn ? 'self-end' : 'self-start'}`}>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="bg-transparent border-none cursor-pointer text-[1.1rem] p-0.5 rounded-full transition-transform duration-150 hover:scale-[1.3]"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Delete confirm */}
        {showDeleteMenu && (
          <div className="animate-fade-in py-2 px-3 bg-card border border-[rgba(239,68,68,0.3)] rounded-md flex gap-2 items-center self-end">
            <span className="text-[0.8rem] text-text-secondary">Delete message?</span>
            <button
              onClick={handleDelete}
              className="py-1 px-2.5 rounded-sm bg-[#ef4444] text-white border-none cursor-pointer text-xs font-semibold"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteMenu(false)}
              className="py-1 px-2 rounded-sm bg-tertiary text-text-secondary border border-border-primary cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Reaction counts */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.reactions.map((r) => {
              const iMine = r.userIds.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  title={`React with ${r.emoji}`}
                  className={`flex items-center gap-1 py-1 px-2 rounded-full cursor-pointer text-[0.8rem] text-text-primary transition-transform duration-150 hover:scale-[1.08] ${iMine ? 'bg-accent-glow border border-accent-primary' : 'bg-card border border-border-primary'}`}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[0.72rem] text-text-secondary">
                    {r.userIds.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[0.68rem] text-text-muted px-0.5">
          {formatTimestamp(message._creationTime)}
        </span>
      </div>
    </div>
  );
}
