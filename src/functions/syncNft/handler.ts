import { NftEntity } from "../../libs/index";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { SyncNftInput } from "./schema";
import { BadRequest } from "http-errors";
import { buildNftPK } from "../../libs/apeNftEntity";
import { nftSyncedEvent } from "../../libs/nftSyncedEvent/event";
import pick from "lodash/pick";
import { eventBus } from "../../libs/bus";

const syncNft = async (event: SyncNftInput) => {
  console.log("event", JSON.stringify(event, null, 2));
  const { userId } = event.body;

  const { Items: nfts } = await NftEntity.query(buildNftPK({ userId }));

  if (nfts === undefined) {
    throw new BadRequest(`User ${userId} has no Nft`);
  }

  const events = nfts.map((nft) =>
    nftSyncedEvent.create(
      pick(nft, ["userId", "nftId", "nftRarity", "mintTimestamp"])
    )
  );
  await eventBus.put(events);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Synced ${events.length} NFTs for user ${userId}`,
    }),
  };
};

export const handler = middy()
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .handler(syncNft);
