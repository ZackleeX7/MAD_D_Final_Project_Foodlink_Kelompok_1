import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 🔥 GET USER (ambil 1 user saja - simple app)
export const getUser = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

// 🔥 SET / UPDATE USER
export const setUser = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        image: args.image,
      });
    } else {
      await ctx.db.insert("users", {
        name: args.name,
        image: args.image,
      });
    }
  },
});