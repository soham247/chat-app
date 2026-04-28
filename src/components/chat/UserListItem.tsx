"use client";

import { Id } from "../../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

interface UserListItemProps {
  user: User;
  onClick: () => void;
  isLoading?: boolean;
}

export function UserListItem({ user, onClick, isLoading }: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center gap-3 py-2.5 px-4 w-[calc(100%-0.5rem)] mx-1 text-left bg-transparent border-none rounded-md transition-colors duration-150 hover:bg-tertiary ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      <div className="relative shrink-0">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-[38px] h-[38px] rounded-xl object-cover border border-border-subtle"
          />
        ) : (
          <div className="w-[38px] h-[38px] rounded-xl bg-text-primary flex items-center justify-center text-[0.9rem] font-semibold text-bg-card">
            {user.name[0]?.toUpperCase()}
          </div>
        )}
        {user.isOnline && (
          <span className="absolute bottom-[1px] right-[1px] w-2.5 h-2.5 rounded-full bg-online-green border-2 border-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
          {user.name}
        </p>
        <p className={`text-xs ${user.isOnline ? 'text-online-green' : 'text-text-muted'}`}>
          {user.isOnline ? "Online" : "Offline"}
        </p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="text-text-muted"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
