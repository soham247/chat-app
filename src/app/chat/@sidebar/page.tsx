"use client";

import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { NewChatModal } from "@/components/NewChatModal";
import { ConversationSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const me = useQuery(api.users.current);
  const conversations = useQuery(api.conversations.getUserConversations);
  // "search" drives live filtering; second query is always-on for the modal
  const allUsers = useQuery(api.users.getUsers, { queryStr: search });
  const allUsersUnfiltered = useQuery(api.users.getUsers, { queryStr: "" });
  const setOnline = useMutation(api.users.setOnline);
  const createOrGetDM = useMutation(api.conversations.createOrGetDM);

  // Online presence
  useEffect(() => {
    setOnline({ isOnline: true });
    const handleUnload = () => setOnline({ isOnline: false });
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      setOnline({ isOnline: false });
    };
  }, [setOnline]);

  const activeChatId = pathname?.split("/chat/")?.[1];

  const handleOpenConversation = (id: Id<"conversations">) => {
    router.push(`/chat/${id}`);
  };

  const handleOpenDM = async (userId: Id<"users">) => {
    const id = await createOrGetDM({ otherUserId: userId });
    router.push(`/chat/${id}`);
    setSearch("");
  };

  // Filter existing conversations by search
  const filteredConversations = (conversations ?? []).filter((c) => {
    if (!search) return true;
    const other = c.participants.filter(Boolean).find((p) => p?._id !== me?._id);
    const name = c.isGroup ? c.name ?? "" : other?.name ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Users who don't yet have a conversation (for search suggestions)
  const existingParticipantIds = new Set(
    (conversations ?? [])
      .filter((c) => !c.isGroup)
      .flatMap((c) => c.participantIds)
  );
  const newUsers = search
    ? (allUsers ?? []).filter((u) => !existingParticipantIds.has(u._id))
    : [];

  const showSearchResults = search.length > 0;

  return (
    <div className="flex flex-col h-screen bg-secondary border-r border-border-primary overflow-hidden">

      {/* ── Header ── */}
      <div className="pt-4 px-4 bg-secondary">
        <div className="flex items-center justify-between mb-3.5">
          {/* Logo + title */}
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#5b7fff] to-[#8b5cf6] flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <h1 className="font-bold text-lg text-text-primary tracking-[-0.01em]">Relay</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-input border border-border-primary rounded-full mb-3 transition-colors duration-200 focus-within:border-accent-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="flex-1 bg-transparent border-none text-text-primary text-sm outline-none min-w-0"
            suppressHydrationWarning
          />
          {search && (
            <button onClick={() => setSearch("")} className="bg-none border-none cursor-pointer text-text-muted flex leading-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* Search: matching new users to start a DM with */}
        {showSearchResults && newUsers.length > 0 && (
          <>
            <p className="text-[0.7rem] font-bold text-text-muted px-5 py-2 uppercase tracking-[0.06em]">
              Contacts
            </p>
            {newUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleOpenDM(user._id)}
                className="flex items-center gap-3.5 w-full px-5 py-3 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-tertiary"
              >
                <div className="relative shrink-0">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-border-primary" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5b7fff] to-[#8b5cf6] flex items-center justify-center text-lg font-bold text-white">
                      {user.name[0]?.toUpperCase()}
                    </div>
                  )}
                  {user.isOnline && <span className="absolute bottom-[2px] right-[2px] w-3 h-3 rounded-full bg-online-green border-2 border-secondary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[0.9rem] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                  <p className={`text-[0.78rem] ${user.isOnline ? 'text-online-green' : 'text-text-muted'}`}>{user.isOnline ? "Online" : "Tap to start a chat"}</p>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Section label "Chats" when searching and there are conv results */}
        {showSearchResults && filteredConversations.length > 0 && (
          <p className="text-[0.7rem] font-bold text-text-muted px-5 py-2 uppercase tracking-[0.06em]">
            Chats
          </p>
        )}

        {/* Conversations list */}
        {conversations === undefined ? (
          Array.from({ length: 6 }).map((_, i) => <ConversationSkeleton key={i} />)
        ) : filteredConversations.length === 0 && (!showSearchResults || newUsers.length === 0) ? (
          <EmptyState
            icon={search ? "🔍" : "💬"}
            title={search ? "No results" : "No chats yet"}
            description={
              search
                ? `Nothing found for "${search}"`
                : 'Tap the ✎ button to start a new chat'
            }
          />
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv as Parameters<typeof ConversationItem>[0]["conversation"]}
              currentUserId={me!._id}
              isActive={activeChatId === conv._id}
              onClick={() => handleOpenConversation(conv._id)}
            />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && allUsersUnfiltered !== undefined && (
        <NewChatModal
          users={allUsersUnfiltered}
          onClose={() => setShowNewChat(false)}
          onOpenConversation={(id) => { handleOpenConversation(id); setShowNewChat(false); }}
        />
      )}
    </div>
  );
}