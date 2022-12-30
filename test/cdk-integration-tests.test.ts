import { describe, expect, it } from "vitest";
import { NftEntity } from "../src/libs/apeNftEntity";
import { ulid } from "ulid";
import axios from "axios";

const userId = "Corentin";
describe("syncNft", () => {
  it("emit an Nft Event", async () => {
    await NftEntity.put({
      nftRarity: "RARE",
      mintTimestamp: "2021-09-01T00:00:00.000Z",
      userId,
      nftId: ulid(),
    });
    const response = await axios.post(`${process.env.API_URL}/sync-nft`, {
      userId,
    });
    expect(response.status).toBe(200);
  });
});
