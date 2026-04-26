import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 🔥 GET DATA (Dashboard)
export const getDonations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("donations")
      .order("desc")
      .collect();
  },
});

// 🔥 ADD DATA (Donate screen nanti)
export const addDonation = mutation({
  args: {
    food: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("taken"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", {
      food: args.food,
      status: args.status,
    });
  },
});