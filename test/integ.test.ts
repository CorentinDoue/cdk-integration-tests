import { App } from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import { ExpectedResult, IntegTest } from "@aws-cdk/integ-tests-alpha";

const app = new App();
const stack = new AppStack(app, "TestStack");

const integ = new IntegTest(app, "createNft", {
  testCases: [stack],
});

const mockedEvent = {
  version: "2.0",
  routeKey: "POST /nft",
  rawPath: "/nft",
  rawQueryString: "",
  headers: {
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "content-length": "28",
    "content-type": "application/json",
    host: "dezuo4uj5f.execute-api.us-east-1.amazonaws.com",
    "postman-token": "10f0479f-812a-4032-bd74-f65ba2aefb70",
    "user-agent": "PostmanRuntime/7.29.2",
    "x-amzn-trace-id": "Root=1-6393611d-19d2062a7ddb46846333fa25",
    "x-forwarded-for": "46.193.107.8",
    "x-forwarded-port": "443",
    "x-forwarded-proto": "https",
  },
  requestContext: {
    accountId: "032062562436",
    apiId: "dezuo4uj5f",
    domainName: "dezuo4uj5f.execute-api.us-east-1.amazonaws.com",
    domainPrefix: "dezuo4uj5f",
    http: {
      method: "POST",
      path: "/nft",
      protocol: "HTTP/1.1",
      sourceIp: "46.193.107.8",
      userAgent: "PostmanRuntime/7.29.2",
    },
    requestId: "c4wcmi_aoAMESRw=",
    routeKey: "POST /nft",
    stage: "$default",
    time: "09/Dec/2022:16:23:57 +0000",
    timeEpoch: 1670603037215,
  },
  body: '{\n    "userId": "Corentin"\n}',
  isBase64Encoded: false,
};

integ.assertions
  .invokeFunction({
    functionName: stack.createNftFunction.functionName,
    payload: JSON.stringify(mockedEvent),
  })
  .expect(
    ExpectedResult.objectLike({
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: ExpectedResult.stringLikeRegexp(".*"),
    })
  );
// integ.assertions.awsApiCall("ApiGatewayV2", "nftPost", {});
