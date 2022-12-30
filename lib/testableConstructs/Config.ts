import { Construct } from "constructs";
import { TestableConstruct } from "./types";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export const getDownDependencies = <
  Dependencies extends Record<string, TestableConstruct>
>(
  dependencies: Dependencies
): Dependencies =>
  Object.entries(dependencies).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value.testDownConstruct }),
    {} as Dependencies
  );

type ConfigProps<Dependencies extends Record<string, TestableConstruct>> = {
  dependencies: Dependencies;
  getValue: (dependencies: Dependencies) => string;
};
export class Config<
  Dependencies extends Record<string, TestableConstruct>
> extends Construct {
  environment: Record<string, string>;
  testEnvironment: Record<string, string>;
  constructor(scope: Construct, id: string, props: ConfigProps<Dependencies>) {
    super(scope, id);
    const value = props.getValue(props.dependencies);
    const testValue = props.getValue(getDownDependencies(props.dependencies));

    new StringParameter(scope, `${id}_TestParameter`, {
      stringValue: testValue,
      parameterName: `${id}_TestParameter`,
    });

    this.environment = {
      [id]: value,
    };
    this.testEnvironment = {
      [id]: testValue,
    };
  }
}
