import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  donations: defineTable({
    foodType: v.string(),
    quantity: v.number(),
    location: v.string(),
    expiryTime: v.string(),
    status: v.string(),
  }),

  receivers: defineTable({
    name: v.string(),
    location: v.string(),
    needLevel: v.number(),
    currentStock: v.number(),
  }),
});