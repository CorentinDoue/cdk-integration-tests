import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
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
import { Config } from "./testableConstructs/Config";

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
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    const tableNameConfig = new Config(this, "TABLE_NAME", {
      dependencies: { table },
      getValue: ({ table }) => table.tableName,
    });

    const eventBus = new EventBus(this, "EventBus");
    const eventBusNameConfig = new Config(this, "EVENT_BUS_NAME", {
      dependencies: { eventBus },
      getValue: ({ eventBus }) => eventBus.eventBusName,
    });

    const deadLetterQueue = new Queue(this, "DLQ");

    const httpApi = new HttpApi(this, "HttpApi");
    new Config(this, "API_URL", {
      dependencies: { httpApi },
      getValue: ({ httpApi }) => httpApi.url as string, // url is defined because httpApi has default stage
    });

    const syncNftFunction = new NodejsFunction(this, "SyncNft", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `/../src/functions/syncNft/handler.ts`),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
      configs: [tableNameConfig, eventBusNameConfig],
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
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
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
