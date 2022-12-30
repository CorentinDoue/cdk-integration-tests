import { NodejsFunction as CdkNodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs/lib/function";
import { Construct } from "constructs";
import { TestableConstruct } from "./types";

const getDownDependencies = <
  Dependencies extends Record<string, TestableConstruct>
>(
  dependencies: Dependencies
): Dependencies =>
  Object.entries(dependencies).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value.testDownConstruct }),
    {} as Dependencies
  );

export class NodejsFunction<
  Dependencies extends Record<string, TestableConstruct>
> extends CdkNodejsFunction {
  testFunction: CdkNodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: Omit<NodejsFunctionProps, "environment"> & {
      getEnvironment: (dependencies: Dependencies) => { [key: string]: string };
      dependencies: Dependencies;
    }
  ) {
    super(scope, id, {
      ...props,
      environment: props.getEnvironment(props.dependencies),
    });
    this.testFunction = new CdkNodejsFunction(scope, `Test${id}`, {
      ...props,
      environment: props.getEnvironment(
        getDownDependencies(props.dependencies)
      ),
    });
  }
}
