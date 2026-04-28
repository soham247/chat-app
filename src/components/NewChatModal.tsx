"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

interface NewChatModalProps {
  users: User[];
  onClose: () => void;
  onOpenConversation: (id: Id<"conversations">) => void;
}

type View = "contacts" | "group-select" | "group-name";

export function NewChatModal({ users, onClose, onOpenConversation }: NewChatModalProps) {
  const [view, setView] = useState<View>("contacts");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<Id<"users">>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createOrGetDM = useMutation(api.conversations.createOrGetDM);
  const createGroup = useMutation(api.conversations.createGroup);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDM = async (userId: Id<"users">) => {
    setLoading(true);
    try {
      const id = await createOrGetDM({ otherUserId: userId });
      onOpenConversation(id);
      onClose();
    } catch {
      setError("Failed to open chat");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { setError("Group name is required"); return; }
    if (selected.size < 1) { setError("Pick at least 1 member"); return; }
    setLoading(true);
    setError("");
    try {
      const id = await createGroup({ name: groupName.trim(), memberIds: Array.from(selected) });
      onOpenConversation(id);
      onClose();
    } catch {
      setError("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id: Id<"users">) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const title =
    view === "contacts" ? "New Chat" :
      view === "group-select" ? "Add Members" : "Group Name";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-slide-in bg-secondary border border-border-primary rounded-xl w-full max-w-[420px] max-h-[75vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="py-4 px-5 border-b border-border-primary flex items-center gap-3.5 shrink-0">
          <h2 className="font-bold text-base text-text-primary flex-1">{title}</h2>
          {view === "contacts" && (
            <button
              onClick={() => { setView("group-select"); setSearch(""); }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-accent-glow border border-accent-primary text-accent-primary cursor-pointer text-[0.75rem] font-semibold"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              New Group
            </button>
          )}
          {view === "group-select" && selected.size > 0 && (
            <button onClick={() => setView("group-name")} className="py-1.5 px-3.5 rounded-full bg-accent-primary border-none text-white cursor-pointer text-[0.75rem] font-bold">
              Next ({selected.size})
            </button>
          )}
        </div>

        {/* Selected chips (group mode) */}
        {view === "group-select" && selected.size > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 px-4 shrink-0">
            {Array.from(selected).map((id) => {
              const u = users.find((u) => u._id === id);
              if (!u) return null;
              return (
                <button key={id} onClick={() => toggleUser(id)} className="flex items-center gap-1.5 py-1 pr-2.5 pl-1.5 rounded-full bg-accent-glow border border-accent-primary cursor-pointer">
                  <img src={u.imageUrl} alt={u.name} className="w-5 h-5 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="text-[0.75rem] text-accent-primary font-medium">{u.name.split(" ")[0]}</span>
                  <span className="text-[0.7rem] text-accent-primary opacity-70">✕</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Group name input */}
        {view === "group-name" && (
          <div className="p-5 shrink-0">
            <label className="text-[0.8rem] text-text-secondary block mb-2">Group Name</label>
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              placeholder="Enter group name…"
              maxLength={50}
              className="w-full py-3 px-4 rounded-md bg-input border border-border-primary text-text-primary text-[0.9rem] outline-none focus:border-accent-primary transition-colors"
            />
            <p className="text-[0.75rem] text-text-muted mt-2">{selected.size + 1} member{selected.size !== 0 ? "s" : ""} (including you)</p>
            {error && <p className="text-[0.8rem] text-[#ef4444] mt-1.5">⚠ {error}</p>}
          </div>
        )}

        {/* Search (contacts + group-select) */}
        {view !== "group-name" && (
          <div className="py-3 px-4 shrink-0">
            <div className="flex items-center gap-2 py-2 px-3.5 bg-input border border-border-primary rounded-full focus-within:border-accent-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-muted shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus={view === "contacts"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={view === "contacts" ? "Search contacts…" : "Search to add…"}
                className="flex-1 bg-transparent border-none text-text-primary text-[0.875rem] outline-none"
              />
            </div>
          </div>
        )}

        {/* List */}
        {view !== "group-name" && (
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-[0.875rem]">
                {search ? `No contacts matching "${search}"` : "No contacts available"}
              </div>
            ) : (
              filtered.map((user) => {
                const isSelected = selected.has(user._id);
                return (
                  <button
                    key={user._id}
                    disabled={loading}
                    onClick={() => view === "contacts" ? handleDM(user._id) : toggleUser(user._id)}
                    className={`flex items-center gap-3.5 w-full py-3 px-5 border-none cursor-pointer text-left transition-colors duration-150 ${isSelected ? 'bg-accent-glow' : 'bg-transparent hover:bg-tertiary'}`}
                  >
                    <div className="relative shrink-0">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} className="w-[44px] h-[44px] rounded-xl object-cover border border-border-subtle" />
                      ) : (
                        <div className="w-[44px] h-[44px] rounded-xl bg-text-primary flex items-center justify-center text-base font-bold text-bg-card">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                      {user.isOnline && <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] rounded-full bg-online-green border-2 border-secondary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[0.9rem] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                      <p className={`text-[0.75rem] ${user.isOnline ? 'text-online-green' : 'text-text-muted'}`}>{user.isOnline ? "Online" : "Offline"}</p>
                    </div>
                    {view === "group-select" && (
                      <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${isSelected ? 'border-accent-primary bg-accent-primary' : 'border-border-primary bg-transparent'}`}>
                        {isSelected && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Group create button */}
        {view === "group-name" && (
          <div className="py-4 px-5 border-t border-border-primary shrink-0">
            <button
              onClick={handleCreateGroup}
              disabled={loading || !groupName.trim()}
              className={`w-full py-3.5 rounded-full border-none font-bold text-[0.9rem] ${loading || !groupName.trim() ? 'bg-tertiary text-text-muted cursor-default' : 'bg-accent-primary text-bg-card cursor-pointer'}`}
            >
              {loading ? "Creating…" : "Create Group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
