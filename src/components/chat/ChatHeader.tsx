"use client";

import { Id } from "../../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

interface ChatHeaderProps {
  conversation: {
    _id: Id<"conversations">;
    name?: string;
    isGroup: boolean;
    participants: User[];
  };
  currentUserId: Id<"users">;
  onBack?: () => void;
}

export function ChatHeader({ conversation, currentUserId, onBack }: ChatHeaderProps) {
  const other = conversation.participants.find((p) => p._id !== currentUserId);
  const displayName = conversation.isGroup
    ? (conversation.name ?? "Group Chat")
    : (other?.name ?? "Unknown");
  const avatarUrl = conversation.isGroup ? null : other?.imageUrl;
  const isOnline = !conversation.isGroup && (other?.isOnline ?? false);
  const memberCount = conversation.participants.length;

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border-primary bg-secondary/95 backdrop-blur-md sticky top-0 z-10">
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-tertiary border-none cursor-pointer text-text-primary shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-xl object-cover border border-border-subtle"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-text-primary flex items-center justify-center text-base font-semibold text-bg-card">
            {conversation.isGroup ? "👥" : displayName[0]?.toUpperCase()}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] rounded-full bg-online-green border-2 border-secondary" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-[0.9375rem] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
          {displayName}
        </h2>
        <p className={`text-xs ${conversation.isGroup ? 'text-text-secondary' : isOnline ? 'text-online-green' : 'text-text-muted'}`}>
          {conversation.isGroup
            ? `${memberCount} members`
            : isOnline
              ? "Online"
              : "Offline"}
        </p>
      </div>
    </div>
  );
}
