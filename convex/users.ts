import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || "",
      imageUrl: data.image_url || "",
      isOnline: true,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);
    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
    }
  },
});

export const setOnline = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, { isOnline }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;
    await ctx.db.patch(user._id, { isOnline });
  },
});

export const getUsers = query({
  args: { queryStr: v.string() },
  handler: async (ctx, { queryStr }) => {
    const me = await getCurrentUser(ctx);
    const users = (await ctx.db.query("users").collect()).filter(
      (u) =>
        u._id !== me?._id &&
        u.name.toLowerCase().includes(queryStr.toLowerCase())
    );
    return users;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    return users.filter(Boolean);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) return null;
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", externalId))
    .unique();
}