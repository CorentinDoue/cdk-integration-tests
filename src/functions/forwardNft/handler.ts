import { nftSyncedEvent } from "../../libs/nftSyncedEvent/event";
import { PublishedEvent } from "typebridge";

export const handler = async (event: PublishedEvent<typeof nftSyncedEvent>) => {
  console.log("event", JSON.stringify(event, null, 2));
};
