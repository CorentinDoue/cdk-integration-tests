import { Parameter } from "@aws-sdk/client-ssm";
import {
  downstreamConfigParameterPath,
  testConfigParameterPath,
  upstreamConfigParameterPath,
} from "../../lib/testableConstructs/configConsts";
import fs from "fs";
import { streamPathToEnvPrefix } from "./configConsts";
import { getTestConfigParameters } from "./getTestConfigParameters";
import * as path from "path";

const defaultCacheFile = "testConfigCache.json";
export type CacheFileType = {
  lastFetchedDate: string; // iso string date
  envVars: Record<string, string>;
};

const cacheDurationInMs = 1000 * 60 * 60; // 1h

const getEnvVarFromParameter = ({
  Name,
  Value,
}: Parameter): Record<string, string> => {
  if (Name === undefined || Value === undefined) {
    throw new Error(
      "Fetched SSM Parameter is invalid. This should not happen."
    );
  }
  const [emptyPart, configPart, streamPart, namePart] = Name.split("/");
  if (
    emptyPart !== "" ||
    configPart === undefined ||
    configPart !== testConfigParameterPath ||
    streamPart === undefined ||
    (streamPart !== upstreamConfigParameterPath &&
      streamPart !== downstreamConfigParameterPath) ||
    namePart === undefined
  ) {
    console.warn(
      `Found parameter ${Name} in test configs path, but it is invalid. Skipping it.`
    );
    return {};
  }

  return {
    [`${streamPathToEnvPrefix[streamPart]}${namePart}`]: Value,
  };
};
const fetchEnvVars = async (): Promise<Record<string, string>> => {
  const parameters = await getTestConfigParameters();
  return parameters.reduce<Record<string, string>>(
    (envVars, parameter) => ({
      ...envVars,
      ...getEnvVarFromParameter(parameter),
    }),
    {}
  );
};

const importCacheFile = async (cacheFilePath: string): Promise<CacheFileType> =>
  import(`${cacheFilePath}?version=${Number(new Date())}`); // force reload the file from disk. Otherwise, it's cached by nodejs
const getCacheAgeInMs = async (
  cacheFilePath: string
): Promise<number | undefined> => {
  try {
    const { lastFetchedDate } = await importCacheFile(cacheFilePath);
    return new Date().getTime() - new Date(lastFetchedDate).getTime();
  } catch (e) {
    console.warn("Test config cache file not found or invalid");
    return undefined;
  }
};

const writeCache = (envVars: Record<string, string>, cacheFilePath: string) => {
  const cache: CacheFileType = {
    lastFetchedDate: new Date().toISOString(),
    envVars,
  };
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
};

const loadEnvVarsFromCache = async (cacheFilePath: string) => {
  const { envVars } = await importCacheFile(cacheFilePath);
  Object.assign(process.env, envVars);
};
export const syncTestConfigs = async (
  cacheFilePath: string = defaultCacheFile
) => {
  const absoluteCacheFilePath = path.resolve(cacheFilePath);
  const cacheAge = await getCacheAgeInMs(absoluteCacheFilePath);
  if (cacheAge === undefined || cacheAge > cacheDurationInMs) {
    const envVars = await fetchEnvVars();
    writeCache(envVars, absoluteCacheFilePath);
  }
  await loadEnvVarsFromCache(absoluteCacheFilePath);
};
