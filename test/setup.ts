import { vi } from "vitest";
import { setupConfigAsIntegrationTest, syncTestConfigs } from "../src/config";

process.env.AWS_PROFILE = "default";
process.env.AWS_REGION = "us-east-1";
setupConfigAsIntegrationTest();
await syncTestConfigs();

vi.resetModules(); // this is needed only because I test functions from ../src/config which is imported here. It creates some problems with mocks. cf https://github.com/vitest-dev/vitest/issues/1450
