import {
  upstreamConfigParameterPath,
  downstreamConfigParameterPath,
} from "../../lib/testableConstructs/configConsts";

export const CONFIG_TEST_UP_PREFIX = "CONFIG_TEST_UP_";
export const CONFIG_TEST_DOWN_PREFIX = "CONFIG_TEST_DOWN_";

export const streamPathToEnvPrefix = {
  [upstreamConfigParameterPath]: CONFIG_TEST_UP_PREFIX,
  [downstreamConfigParameterPath]: CONFIG_TEST_DOWN_PREFIX,
} as const;
