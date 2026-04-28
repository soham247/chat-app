import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

const TYPING_TIMEOUT_MS = 3000;

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, { conversationId, isTyping }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return;

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("byConversationUser", (q) =>
        q.eq("conversationId", conversationId).eq("userId", me._id)
      )
      .unique();

    if (isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { timestamp: Date.now() });
      } else {
        await ctx.db.insert("typingIndicators", {
          conversationId,
          userId: me._id,
          timestamp: Date.now(),
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const now = Date.now();
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("byConversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    const activeTypers = indicators.filter(
      (i) => i.userId !== me._id && now - i.timestamp < TYPING_TIMEOUT_MS
    );

    const users = await Promise.all(
      activeTypers.map((i) => ctx.db.get(i.userId))
    );

    return users.filter(Boolean);
  },
});
