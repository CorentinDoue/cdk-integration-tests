import { LambdaFunction as CdkLambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { NodejsFunction } from "./NodejsFunction";
import { LambdaFunctionProps as CdkLambdaFunctionProps } from "aws-cdk-lib/aws-events-targets/lib/lambda";
import { Queue } from "./Queue";
import { shouldDeployTestConstructs } from "./testStack";

type LambdaFunctionProps = Omit<CdkLambdaFunctionProps, "deadLetterQueue"> & {
  deadLetterQueue?: Queue;
};
export class LambdaFunction extends CdkLambdaFunction {
  testConstruct: CdkLambdaFunction;
  constructor(handler: NodejsFunction<any>, props?: LambdaFunctionProps) {
    super(handler, props);
    if (shouldDeployTestConstructs(handler)) {
      this.testConstruct = new CdkLambdaFunction(handler.testFunction, {
        ...props,
        deadLetterQueue: props?.deadLetterQueue?.testDownConstruct,
      });
    }
  }
}
