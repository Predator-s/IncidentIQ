import { z } from "zod";

export const severitySuggestSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(5000),
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1, "At least one message is required")
    .max(20, "Too many messages"),
});

export type SeveritySuggestInput = z.infer<typeof severitySuggestSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
