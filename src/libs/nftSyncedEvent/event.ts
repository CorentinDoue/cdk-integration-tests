import { Event } from "typebridge";
import { nftSyncedSchema } from "./schema";
import { eventBus } from "../bus";

export const nftSyncedEvent = new Event({
  name: "NFT_SYNCED",
  source: "ape-nft",
  schema: nftSyncedSchema,
  bus: eventBus,
});
