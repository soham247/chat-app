"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

interface CreateGroupModalProps {
  users: User[];
  onClose: () => void;
  onCreated: (conversationId: Id<"conversations">) => void;
}

export function CreateGroupModal({ users, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<Id<"users">>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createGroup = useMutation(api.conversations.createGroup);

  const toggleUser = (id: Id<"users">) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError("Group name is required"); return; }
    if (selected.size < 1) { setError("Select at least 1 other member"); return; }

    setLoading(true);
    setError("");
    try {
      const id = await createGroup({
        name: name.trim(),
        memberIds: Array.from(selected),
      });
      onCreated(id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-slide-in bg-secondary border border-border-primary rounded-xl p-6 w-full max-w-[440px] max-h-[80vh] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-text-primary">
            New Group Chat
          </h2>
          <button
            onClick={onClose}
            className="bg-tertiary border-none rounded-full w-8 h-8 cursor-pointer text-text-secondary flex items-center justify-center text-base"
          >
            ✕
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-[0.8rem] text-text-secondary mb-1.5 block">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Project Team, Family…"
            maxLength={50}
            className="w-full py-2.5 px-3.5 rounded-md bg-input border border-border-primary text-text-primary text-[0.9rem] outline-none transition-colors duration-200 focus:border-accent-primary"
          />
        </div>

        {/* Members */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[0.8rem] text-text-secondary">Members</label>
            <span className="text-[0.75rem] text-accent-primary">
              {selected.size} selected
            </span>
          </div>
          <div className="overflow-y-auto max-h-[240px] border border-border-primary rounded-md bg-input">
            {users.map((user) => {
              const isSelected = selected.has(user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`flex items-center gap-3 w-full py-2.5 px-3.5 border-none cursor-pointer text-left transition-colors duration-150 border-b border-border-subtle ${isSelected ? 'bg-accent-glow' : 'bg-transparent hover:bg-tertiary'}`}
                >
                  <div className="relative shrink-0">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-border-subtle"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-text-primary flex items-center justify-center text-[0.9rem] font-semibold text-bg-card">
                        {user.name[0]?.toUpperCase()}
                      </div>
                    )}
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full bg-online-green border-2 border-input" />
                    )}
                  </div>
                  <span className="flex-1 text-[0.875rem] text-text-primary font-medium">
                    {user.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${isSelected ? 'border-accent-primary bg-accent-primary' : 'border-border-primary bg-transparent'}`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
            {users.length === 0 && (
              <p className="p-4 text-text-muted text-[0.875rem] text-center">
                No users available
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-[0.8rem] text-[#ef4444]">⚠ {error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-tertiary border border-border-primary text-text-secondary cursor-pointer font-medium text-[0.875rem]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`flex-[2] py-3 rounded-full border-none font-semibold text-[0.875rem] shadow-none ${loading ? 'bg-tertiary text-text-muted cursor-wait' : 'bg-accent-primary text-bg-card cursor-pointer'}`}
          >
            {loading ? "Creating…" : `Create Group${selected.size > 0 ? ` (${selected.size + 1})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
