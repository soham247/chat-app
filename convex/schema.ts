import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
  }).index("byClerkId", ["clerkId"]),

  conversations: defineTable({
    name: v.optional(v.string()), // group name; undefined for DMs
    isGroup: v.boolean(),
    participantIds: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
    lastActivity: v.number(), // timestamp ms
  }).index("byLastActivity", ["lastActivity"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.boolean(),
    reactions: v.array(
      v.object({
        emoji: v.string(),
        userIds: v.array(v.id("users")),
      })
    ),
  })
    .index("byConversation", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    timestamp: v.number(),
  })
    .index("byConversation", ["conversationId"])
    .index("byConversationUser", ["conversationId", "userId"]),

  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadTime: v.number(),
  }).index("byConversationUser", ["conversationId", "userId"]),
});