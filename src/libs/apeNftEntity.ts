import { Entity } from "dynamodb-toolbox";

import apeNftTable from "./apeNftTable";
import { PARTITION_KEY, SORT_KEY } from "./keys";

export const buildNftPK = ({ userId }: { userId: string }) =>
  `USER_ID#${userId}`;

export const NftEntity = new Entity({
  name: "NftEntity",
  attributes: {
    [PARTITION_KEY]: {
      partitionKey: true,
      hidden: true,
      default: buildNftPK,
    },
    [SORT_KEY]: {
      sortKey: true,
      hidden: true,
      default: ({ nftId }: { nftId: string }) => `NFT_ID#${nftId}`,
    },
    nftRarity: { type: "string", required: true },
    mintTimestamp: { type: "string", required: true },
    userId: { type: "string", required: true },
    nftId: { type: "string", required: true },
  },
  table: apeNftTable,
} as const);
