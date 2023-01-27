import { NodejsFunction as CdkNodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunctionProps as CdkNodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs/lib/function";
import { Construct } from "constructs";
import { TestableConstruct } from "./types";
import { Config } from "./Config";
import { getTestStack } from "./testStack";

type NodejsFunctionProps = CdkNodejsFunctionProps & {
  configs?: Config<any>[];
};

const mergeEnvironments = ({
  environment,
  configs,
  testEnv,
}: {
  environment: Record<string, string> | undefined;
  configs: Config<any>[] | undefined;
  testEnv?: boolean;
}): Record<string, string> | undefined => {
  if (environment === undefined && configs === undefined) {
    return undefined;
  }
  return Object.assign(
    environment ?? {},
    ...(configs ?? []).map((config) =>
      testEnv ? config.testEnvironment : config.environment
    )
  );
};

export class NodejsFunction<
  Dependencies extends Record<string, TestableConstruct>
> extends CdkNodejsFunction {
  testFunction: CdkNodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    { environment, configs, ...restProps }: NodejsFunctionProps
  ) {
    super(scope, id, {
      ...restProps,
      environment: mergeEnvironments({ environment, configs }),
    });
    const testStack = getTestStack();
    this.testFunction = new CdkNodejsFunction(testStack, `Test${id}`, {
      ...restProps,
      environment: mergeEnvironments({ environment, configs, testEnv: true }),
    });
  }
}
