import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addDonation = mutation({
  args: {
    foodType: v.string(),
    quantity: v.number(),
    location: v.string(),
    expiryTime: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", {
      ...args,
      status: "pending",
    });
  },
});