import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { PARTITION_KEY, SORT_KEY } from "../src/libs/keys";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Table } from "./testableConstructs/Table";
import { EventBus } from "./testableConstructs/EventBus";
import { HttpApi } from "./testableConstructs/HttpApi";
import { HttpLambdaIntegration } from "./testableConstructs/HttpLambdaIntegration";
import { NodejsFunction } from "./testableConstructs/NodejsFunction";
import { LambdaFunction } from "./testableConstructs/Target";
import { Queue } from "./testableConstructs/Queue";
import { Rule } from "./testableConstructs/Rule";

// TODO class abstraite pour les construct qui ont un testUpConstruct et un testDownConstruct
// TODO récupérer via Stack.of(scope) une props de la stack qui défini si les resources de test doivent être définie
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
      getEnvironment: ({ table, eventBus }) => ({
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: eventBus.eventBusName,
      }),
      dependencies: { table, eventBus },
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
      getEnvironment: () => ({}),
      dependencies: {},
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
