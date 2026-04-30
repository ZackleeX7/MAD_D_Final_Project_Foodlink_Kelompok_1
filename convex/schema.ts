import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    image: v.optional(v.string()),
  }),

  donations: defineTable({
    food: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("taken"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    expiryTime: v.optional(v.number()),
  }),
});