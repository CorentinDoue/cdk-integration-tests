import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { PARTITION_KEY, SORT_KEY } from "../src/libs/keys";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";

export class AppStack extends cdk.Stack {
  public table: Table;
  public createNftFunction: NodejsFunction;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new Table(this, "ApeNftTable", {
      partitionKey: {
        name: PARTITION_KEY,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: SORT_KEY,
        type: AttributeType.STRING,
      },
    });

    this.createNftFunction = new NodejsFunction(this, "CreateNft", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `/../src/createNft/createNft.ts`),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });

    this.table.grantReadWriteData(this.createNftFunction);

    const createNftIntegration = new HttpLambdaIntegration(
      "CreateNftIntegration",
      this.createNftFunction
    );

    const httpApi = new HttpApi(this, "HttpApi");

    httpApi.addRoutes({
      path: "/nft",
      methods: [HttpMethod.POST],
      integration: createNftIntegration,
    });
  }
}
