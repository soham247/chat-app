import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, { conversationId, content }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const conv = await ctx.db.get(conversationId);
    if (!conv) throw new Error("Conversation not found");
    if (!conv.participantIds.includes(me._id))
      throw new Error("Not a member of this conversation");

    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: me._id,
      content: content.trim(),
      isDeleted: false,
      reactions: [],
    });

    await ctx.db.patch(conversationId, {
      lastMessageId: messageId,
      lastActivity: Date.now(),
    });

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== me._id)
      throw new Error("Can only delete your own messages");

    await ctx.db.patch(messageId, {
      isDeleted: true,
      content: "",
    });
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, { messageId, emoji }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    const reactions = [...message.reactions];
    const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

    if (existingIdx === -1) {
      // Add new reaction
      reactions.push({ emoji, userIds: [me._id] });
    } else {
      const existing = reactions[existingIdx];
      const hasReacted = existing.userIds.includes(me._id);

      if (hasReacted) {
        // Remove user's reaction
        const newUserIds = existing.userIds.filter((id) => id !== me._id);
        if (newUserIds.length === 0) {
          reactions.splice(existingIdx, 1);
        } else {
          reactions[existingIdx] = { ...existing, userIds: newUserIds };
        }
      } else {
        // Add user to existing reaction
        reactions[existingIdx] = {
          ...existing,
          userIds: [...existing.userIds, me._id],
        };
      }
    }

    await ctx.db.patch(messageId, { reactions });
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return;

    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("byConversationUser", (q) =>
        q.eq("conversationId", conversationId).eq("userId", me._id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId,
        userId: me._id,
        lastReadTime: Date.now(),
      });
    }
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const conv = await ctx.db.get(conversationId);
    if (!conv) return [];
    if (!conv.participantIds.includes(me._id)) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();

    // Attach sender info
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await Promise.all(senderIds.map((id) => ctx.db.get(id)));
    const senderMap = Object.fromEntries(
      senders.filter(Boolean).map((s) => [s!._id, s])
    );

    return messages.map((m) => ({
      ...m,
      sender: senderMap[m.senderId] ?? null,
    }));
  },
});
