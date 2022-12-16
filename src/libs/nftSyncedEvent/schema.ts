export const nftSyncedSchema = {
  type: "object",
  properties: {
    nftRarity: { type: "string" },
    mintTimestamp: { type: "string" },
    userId: { type: "string" },
    nftId: { type: "string" },
  },
  required: ["nftRarity", "mintTimestamp", "userId", "nftId"],
} as const;
