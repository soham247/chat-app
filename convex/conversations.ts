import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const createOrGetDM = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    // Check if a DM already exists between these two users
    const existing = await ctx.db
      .query("conversations")
      .collect();

    const dm = existing.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(me._id) &&
        c.participantIds.includes(otherUserId)
    );

    if (dm) return dm._id;

    const convId = await ctx.db.insert("conversations", {
      isGroup: false,
      participantIds: [me._id, otherUserId],
      lastActivity: Date.now(),
    });

    return convId;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, { name, memberIds }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const allMembers = [...new Set([me._id, ...memberIds])];

    const convId = await ctx.db.insert("conversations", {
      name,
      isGroup: true,
      participantIds: allMembers,
      lastActivity: Date.now(),
    });

    return convId;
  },
});

export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("byLastActivity")
      .order("desc")
      .collect();

    const myConversations = allConversations.filter((c) =>
      c.participantIds.includes(me._id)
    );

    const result = await Promise.all(
      myConversations.map(async (conv) => {
        // Get last message
        let lastMessage = null;
        if (conv.lastMessageId) {
          lastMessage = await ctx.db.get(conv.lastMessageId);
        }

        // Get participants
        const participants = await Promise.all(
          conv.participantIds.map((id) => ctx.db.get(id))
        );

        // Get unread count
        const receipt = await ctx.db
          .query("readReceipts")
          .withIndex("byConversationUser", (q) =>
            q.eq("conversationId", conv._id).eq("userId", me._id)
          )
          .unique();

        const lastReadTime = receipt?.lastReadTime ?? 0;

        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("byConversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .collect();

        const unreadCount = unreadMessages.filter(
          (m) =>
            m.senderId !== me._id &&
            m._creationTime > lastReadTime
        ).length;

        return {
          ...conv,
          lastMessage,
          participants: participants.filter(Boolean),
          unreadCount,
        };
      })
    );

    return result;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return null;

    const conv = await ctx.db.get(conversationId);
    if (!conv) return null;
    if (!conv.participantIds.includes(me._id)) return null;

    const participants = await Promise.all(
      conv.participantIds.map((id) => ctx.db.get(id))
    );

    return {
      ...conv,
      participants: participants.filter(Boolean),
    };
  },
});
