import {
  HttpLambdaIntegration as CdkHttpLambdaIntegration,
  HttpLambdaIntegrationProps,
} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction } from "./NodejsFunction";
import { shouldDeployTestConstructs } from "./testStack";

export class HttpLambdaIntegration extends CdkHttpLambdaIntegration {
  testUpConstruct: CdkHttpLambdaIntegration;
  constructor(
    id: string,
    handler: NodejsFunction<any>,
    props?: HttpLambdaIntegrationProps
  ) {
    super(id, handler, props);
    if (shouldDeployTestConstructs(handler)) {
      this.testUpConstruct = new CdkHttpLambdaIntegration(
        `TestUp${id}`,
        handler.testFunction,
        props
      );
    }
  }
}
