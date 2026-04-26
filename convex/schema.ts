import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  donations: defineTable({
    food: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("taken"),
      v.literal("expired")
    ),
  }),
});