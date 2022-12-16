import { Construct } from "constructs";
import {
  AddRoutesOptions,
  HttpApi as CdkHttpApi,
  HttpApiProps,
  HttpRoute,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "./HttpLambdaIntegration";

export class HttpApi extends CdkHttpApi {
  testUpConstruct: CdkHttpApi;
  testDownConstruct: CdkHttpApi;
  constructor(scope: Construct, id: string, props?: HttpApiProps) {
    super(scope, id, props);
    this.testUpConstruct = new CdkHttpApi(scope, `TestUp${id}`, props);
    this.testDownConstruct = new CdkHttpApi(scope, `TestDown${id}`, props);
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
