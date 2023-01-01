import { afterEach, describe, vi, it, expect } from "vitest";
import subMinutes from "date-fns/subMinutes";
import { getTestConfigParameters } from "./getTestConfigParameters";
import { CacheFileType, syncTestConfigs } from "./syncTestConfigs";
import { unlinkSync, writeFileSync } from "fs";
import * as path from "path";

vi.mock("./getTestConfigParameters.ts");

const testCachePath = "test-temp.json";
const absoluteTestCachePath = path.resolve(testCachePath);
const parameters = [
  { Name: "/testConfig/upstream/TOTO", Value: "toto" },
  { Name: "/testConfig/downstream/TATA", Value: "tata" },
];

const envVars = {
  CONFIG_TEST_UP_TOTO: "toto",
  CONFIG_TEST_DOWN_TATA: "tata",
};

const createCache = (lastFetchedDate: Date) => {
  writeFileSync(
    absoluteTestCachePath,
    JSON.stringify({ lastFetchedDate, envVars }, null, 2)
  );
};

describe("syncTestConfigs", () => {
  afterEach(() => {
    delete process.env.CONFIG_TEST_UP_TOTO;
    delete process.env.CONFIG_TEST_DOWN_TATA;
    try {
      unlinkSync(absoluteTestCachePath);
    } catch (e) {
      console.log(e);
      // ignore
    }
  });
  describe("when cache is not setup", () => {
    it("gets env vars from SSM", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      await syncTestConfigs(testCachePath);
      expect(getTestConfigParameters).toBeCalledTimes(1);
    });
    it("sets env var in process.env from the fetched parameters", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      await syncTestConfigs(testCachePath);
      expect(process.env.CONFIG_TEST_UP_TOTO).toBe("toto");
      expect(process.env.CONFIG_TEST_DOWN_TATA).toBe("tata");
    });
    it("creates a cache file with the env vars", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      await syncTestConfigs(testCachePath);
      const { envVars: cachedEnvVars } = (await import(
        absoluteTestCachePath
      )) as CacheFileType;
      expect(cachedEnvVars).toEqual(envVars);
    });
  });
  describe("when cache is older than one hour", () => {
    it("gets env vars from SSM", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      createCache(subMinutes(new Date(), 61));
      await syncTestConfigs(testCachePath);
      expect(getTestConfigParameters).toBeCalledTimes(1);
    });
    it("sets env var in process.env from the fetched parameters", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      createCache(subMinutes(new Date(), 61));
      await syncTestConfigs(testCachePath);
      expect(process.env.CONFIG_TEST_UP_TOTO).toBe("toto");
      expect(process.env.CONFIG_TEST_DOWN_TATA).toBe("tata");
    });
    it("creates a cache file with the env vars", async () => {
      vi.mocked(getTestConfigParameters).mockResolvedValue(parameters);
      createCache(subMinutes(new Date(), 61));
      await syncTestConfigs(testCachePath);
      const { envVars: cachedEnvVars } = (await import(
        absoluteTestCachePath
      )) as CacheFileType;
      expect(cachedEnvVars).toEqual(envVars);
    });
  });
  describe("when cache is fresher than one hour", () => {
    it("does not get env vars from SSM", async () => {
      createCache(subMinutes(new Date(), 50));
      await syncTestConfigs(testCachePath);
      expect(getTestConfigParameters).not.toHaveBeenCalled();
    });
    it("sets env var in process.env from the fetched parameters", async () => {
      createCache(subMinutes(new Date(), 50));
      await syncTestConfigs(testCachePath);
      expect(process.env.CONFIG_TEST_UP_TOTO).toBe("toto");
      expect(process.env.CONFIG_TEST_DOWN_TATA).toBe("tata");
    });
  });
});
