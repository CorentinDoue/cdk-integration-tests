import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { PARTITION_KEY, SORT_KEY } from "../src/libs/keys";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Queue } from "aws-cdk-lib/aws-sqs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "ApeNftTable", {
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: SORT_KEY,
        type: AttributeType.STRING,
      },
    });

    const eventBus = new EventBus(this, "EventBus");

    const deadLetterQueue = new Queue(this, "DLQ");

    const httpApi = new HttpApi(this, "HttpApi");

    const syncNftFunction = new NodejsFunction(this, "SyncNft", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `/../src/functions/syncNft/handler.ts`),
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
    });

    table.grantReadWriteData(syncNftFunction);
    eventBus.grantPutEventsTo(syncNftFunction);

    const syncNftIntegration = new HttpLambdaIntegration(
        "SyncNftIntegration",
        syncNftFunction
    );

    httpApi.addRoutes({
      path: "/sync-nft",
      methods: [HttpMethod.POST],
      integration: syncNftIntegration,
    });

    const forwardNftFunction = new NodejsFunction(this, "ForwardNft", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `/../src/functions/forwardNft/handler.ts`),
    });

    new Rule(this, "OnNftSynced", {
      eventBus,
      eventPattern: {
        source: ["ape-nft"],
        detailType: ["NFT_SYNCED"],
      },
      targets: [
        new LambdaFunction(forwardNftFunction, {
          deadLetterQueue: deadLetterQueue,
        }),
      ],
    });
  }
}
