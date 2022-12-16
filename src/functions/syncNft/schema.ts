import { FromSchema } from "json-schema-to-ts";

export const eventSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  },
  required: ["body"],
} as const;

export type SyncNftInput = FromSchema<typeof eventSchema>;
