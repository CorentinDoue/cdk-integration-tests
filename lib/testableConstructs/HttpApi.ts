import { Construct } from "constructs";
import {
  AddRoutesOptions,
  HttpApi as CdkHttpApi,
  HttpApiProps,
  HttpRoute,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "./HttpLambdaIntegration";
import { TestableConstruct } from "./types";
import { getTestStack } from "./testStack";

export class HttpApi extends CdkHttpApi implements TestableConstruct {
  testUpConstruct: CdkHttpApi;
  testDownConstruct: CdkHttpApi;
  constructor(scope: Construct, id: string, props?: HttpApiProps) {
    super(scope, id, props);
    const testStack = getTestStack();
    this.testUpConstruct = new CdkHttpApi(testStack, `TestUp${id}`, props);
    this.testDownConstruct = new CdkHttpApi(testStack, `TestDown${id}`, props);
  }

  addRoutes(
    options: Omit<AddRoutesOptions, "integration"> & {
      integration: HttpLambdaIntegration;
    }
  ): HttpRoute[] {
    this.testUpConstruct.addRoutes({
      ...options,
      integration: options.integration.testUpConstruct,
    });
    return super.addRoutes(options);
  }
}
