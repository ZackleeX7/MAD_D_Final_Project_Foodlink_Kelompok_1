import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 📦 GET DONATIONS
export const getDonations = query({
  handler: async (ctx) => {
    return await ctx.db.query("donations").collect();
  },
});

// ➕ ADD DONATION
export const addDonation = mutation({
  args: {
    food: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("taken"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    expiryHours: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("donations", {
      food: args.food,
      status: args.status,
      expiryTime: now + args.expiryHours * 60 * 60 * 1000,
    });
  },
});

// 🔄 UPDATE STATUS (taken / cancelled)
export const updateDonationStatus = mutation({
  args: {
    id: v.id("donations"),
    status: v.union(
      v.literal("pending"),
      v.literal("taken"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});

// ⏰ AUTO EXPIRE (FIXED: handle undefined expiryTime)
export const autoExpire = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    const donations = await ctx.db.query("donations").collect();

    for (const d of donations) {
      if (
        d.status === "pending" &&
        d.expiryTime !== undefined && // 🔥 FIX
        d.expiryTime < now
      ) {
        await ctx.db.patch(d._id, {
          status: "expired",
        });
      }
    }
  },
});