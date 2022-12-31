import { setupConfigAsIntegrationTest } from "../src/config";

process.env.AWS_PROFILE = "default";
process.env.AWS_REGION = "us-east-1";
setupConfigAsIntegrationTest();
process.env.CONFIG_TEST_DOWN_TABLE_NAME =
  "CdkIntegrationTestsStack-TestDownApeNftTable29C563F9-1Q9ITTCLXP13A";
process.env.CONFIG_TEST_UP_API_URL =
  "https://3sqzssfd7d.execute-api.us-east-1.amazonaws.com";
