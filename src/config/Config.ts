import { InitializedConfigs } from "./types";
import { CONFIG_TEST_DOWN_PREFIX, CONFIG_TEST_UP_PREFIX } from "./configConsts";

const UNIT_TEST_MODE = "UNIT_TEST_MODE";
export const setupConfigAsUnitTest = (): void => {
  process.env.CONFIG_MODE = UNIT_TEST_MODE;
};
const isUnitTestConfig = () => process.env.CONFIG_MODE === UNIT_TEST_MODE;

const INTEGRATION_TEST_MODE = "INTEGRATION_TEST_MODE";
export const setupConfigAsIntegrationTest = (): void => {
  process.env.CONFIG_MODE = INTEGRATION_TEST_MODE;
};
const isIntegrationTestConfig = () =>
  process.env.CONFIG_MODE === INTEGRATION_TEST_MODE;

export const useTestUpConfig = () => {
  process.env.CONFIG_USE_TEST_UP = "true";
};

export const useTestDownConfig = () => {
  process.env.CONFIG_USE_TEST_UP = "false";
};

const getTestUpValue = (envVar: string): string => {
  const testUpEnvVarValue = process.env[CONFIG_TEST_UP_PREFIX + envVar];
  if (testUpEnvVarValue === undefined) {
    throw new Error(
      `Fail to load test upstream value for Config.${String(
        envVar
      )}. Please make sure you initialized a Config named ${String(
        envVar
      )} in your CDK stack.`
    );
  }
  return testUpEnvVarValue;
};
const getTestDownValue = (envVar: string): string => {
  const testDownEnvVarValue = process.env[CONFIG_TEST_DOWN_PREFIX + envVar];
  if (testDownEnvVarValue === undefined) {
    throw new Error(
      `Fail to load test downstream value for Config.${String(
        envVar
      )}. Please make sure you initialized a Config named ${String(
        envVar
      )} in your CDK stack.`
    );
  }
  return testDownEnvVarValue;
};

const testUpProxy = new Proxy<InitializedConfigs>({} as any, {
  get(target, envVar): string {
    if (typeof envVar !== "string") {
      throw new Error("Config can only be accessed with a string");
    }
    if (!isIntegrationTestConfig()) {
      throw new Error("Please use Config.testUp in integration tests context");
    }
    return getTestUpValue(envVar);
  },
});

const testDownProxy = new Proxy<InitializedConfigs>({} as any, {
  get(target, envVar): string {
    if (typeof envVar !== "string") {
      throw new Error("Config can only be accessed with a string");
    }
    if (!isIntegrationTestConfig()) {
      throw new Error(
        "Please use Config.testDown in integration tests context"
      );
    }
    return getTestDownValue(envVar);
  },
});

type ConfigType = InitializedConfigs & {
  testUp: InitializedConfigs;
  testDown: InitializedConfigs;
};
export const Config = new Proxy<ConfigType>(
  {
    testUp: testUpProxy,
    testDown: testDownProxy,
  } as any,
  {
    get(target, envVar) {
      if (typeof envVar !== "string") {
        throw new Error("Config can only be accessed with a string");
      }
      if (envVar === "testUp" || envVar === "testDown") {
        return Reflect.get(target, envVar);
      }
      const envVarValue = process.env[envVar];
      if (envVarValue !== undefined) {
        return envVarValue;
      }
      if (isUnitTestConfig()) {
        return "NeverUsed";
      }
      if (isIntegrationTestConfig()) {
        if (process.env.CONFIG_USE_TEST_UP === "true") {
          return getTestUpValue(envVar);
        }
        return getTestDownValue(envVar);
      }
      throw new Error(
        `Cannot use Config.${String(
          envVar
        )}. Please make sure you initialized it in your CDK stack and pass it to your function in the configs array.`
      );
    },
  }
);
