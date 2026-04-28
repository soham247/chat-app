"use client";

import { Id } from "../../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

interface Message {
  _id: Id<"messages">;
  content: string;
  isDeleted: boolean;
  senderId: Id<"users">;
}

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">;
    name?: string;
    isGroup: boolean;
    participantIds: Id<"users">[];
    participants: User[];
    lastMessage?: Message | null;
    unreadCount: number;
    lastActivity: number;
  };
  currentUserId: Id<"users">;
  isActive: boolean;
  onClick: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" });
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
}: ConversationItemProps) {
  const other = conversation.participants.find((p) => p._id !== currentUserId);
  const displayName = conversation.isGroup
    ? (conversation.name ?? "Group")
    : (other?.name ?? "Unknown");
  const avatarUrl = conversation.isGroup ? null : other?.imageUrl;
  const isOnline = !conversation.isGroup && (other?.isOnline ?? false);

  const lastContent = conversation.lastMessage?.isDeleted
    ? "This message was deleted"
    : conversation.lastMessage?.content ?? "";

  const memberCount = conversation.participants.length;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-4 w-full text-left border-none rounded-md cursor-pointer transition-colors duration-150 mx-1 relative ${isActive ? 'bg-hover' : 'bg-transparent hover:bg-tertiary'}`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className={`w-[44px] h-[44px] rounded-xl object-cover ${isActive ? 'border-2 border-accent-primary' : 'border border-border-subtle'}`}
          />
        ) : (
          <div className={`w-[44px] h-[44px] rounded-xl bg-text-primary flex items-center justify-center text-base font-semibold text-bg-card ${isActive ? 'border-2 border-accent-primary' : 'border border-border-subtle'}`}>
            {conversation.isGroup ? "👥" : displayName[0]?.toUpperCase()}
          </div>
        )}
        {/* Online dot */}
        {isOnline && (
          <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] rounded-full bg-online-green border-2 border-primary" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-text-primary overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
            {displayName}
            {conversation.isGroup && (
              <span className="ml-1 text-[0.7rem] text-text-muted font-normal">
                ({memberCount})
              </span>
            )}
          </span>
          <span className="text-[0.7rem] text-text-muted shrink-0">
            {conversation.lastActivity ? formatTime(conversation.lastActivity) : ""}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-[0.8rem] overflow-hidden text-ellipsis whitespace-nowrap max-w-[160px] ${conversation.lastMessage?.isDeleted ? 'text-text-muted italic' : 'text-text-secondary not-italic'}`}>
            {lastContent || "No messages yet"}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-accent-primary text-white text-[0.7rem] font-bold px-1.5 shrink-0">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
