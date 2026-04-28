"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  onSendError?: (err: string) => void;
}

export function MessageInput({ conversationId, onSendError }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);

  const stopTyping = useCallback(() => {
    setTyping({ conversationId, isTyping: false }).catch(() => {});
  }, [conversationId, setTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }

    // Typing indicator
    setTyping({ conversationId, isTyping: true }).catch(() => {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const handleSend = async () => {
    const content = value.trim();
    if (!content || sending) return;

    setValue("");
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Clear typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping();

    setSending(true);
    try {
      await sendMessage({ conversationId, content });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send";
      setError(msg);
      setValue(content); // restore
      onSendError?.(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping();
    };
  }, [stopTyping]);

  return (
    <div className="px-4 py-3.5 border-t border-border-primary bg-secondary">
      {/* Error banner */}
      {error && (
        <div className="animate-fade-in flex items-center justify-between py-2 px-3 mb-2.5 rounded-md bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#ef4444] text-[0.8rem]">
          <span>⚠ {error}</span>
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              className="bg-transparent border-none text-[#ef4444] cursor-pointer font-semibold text-[0.8rem] underline"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="bg-transparent border-none text-[#ef4444] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 bg-input border border-border-primary rounded-full p-2 transition-colors duration-200">
        <button
          className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center p-1.5 mb-0.5 rounded-full transition-colors duration-200 hover:text-text-secondary hover:bg-tertiary"
          title="Add attachment"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 bg-transparent border-none text-text-primary text-[0.9rem] resize-none outline-none leading-relaxed max-h-[160px] overflow-y-auto py-1.5 px-1"
        />
        <button
          className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center p-1.5 mb-0.5 rounded-full transition-colors duration-200 hover:text-text-secondary hover:bg-tertiary"
          title="Add emoji"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </button>
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending}
          className={`flex items-center justify-center w-9 h-9 rounded-full border border-border-subtle shrink-0 transition-all duration-200 ${value.trim() && !sending ? 'bg-accent-primary cursor-pointer hover:scale-[1.08]' : 'bg-tertiary cursor-default'}`}
        >
          {sending ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={value.trim() ? "var(--bg-card)" : "var(--text-muted)"}
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-right text-[0.7rem] text-text-muted mt-1.5">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}
