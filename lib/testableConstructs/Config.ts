import { Construct } from "constructs";
import { TestableConstruct } from "./types";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { syncConfigTypes } from "./configUtils";

export const getDownDependencies = <
  Dependencies extends Record<string, TestableConstruct>
>(
  dependencies: Dependencies
): Dependencies =>
  Object.entries(dependencies).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value.testDownConstruct }),
    {} as Dependencies
  );

export const getUpDependencies = <
  Dependencies extends Record<string, TestableConstruct>
>(
  dependencies: Dependencies
): Partial<Dependencies> =>
  Object.entries(dependencies).reduce<Dependencies>(
    (acc, [key, value]) => ({ ...acc, [key]: value.testUpConstruct }),
    {} as Dependencies
  );

const areAllDependenciesDefined = <
  Dependencies extends Record<string, TestableConstruct>
>(
  dependencies: Partial<Dependencies>
): dependencies is Dependencies =>
  Object.values(dependencies).every((dependency) => dependency !== undefined);

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
    syncConfigTypes(id);
    const value = props.getValue(props.dependencies);
    const testDownValue = props.getValue(
      getDownDependencies(props.dependencies)
    );
    new StringParameter(scope, `${id}_TestDownParameter`, {
      stringValue: testDownValue,
      parameterName: `${id}_TestDownParameter`,
    });

    const upDependencies = getUpDependencies(props.dependencies);
    if (areAllDependenciesDefined(upDependencies)) {
      const testUpValue = props.getValue(upDependencies);
      new StringParameter(scope, `${id}_TestUpParameter`, {
        stringValue: testUpValue,
        parameterName: `${id}_TestUpParameter`,
      });
    }

    this.environment = {
      [id]: value,
    };
    this.testEnvironment = {
      [id]: testDownValue,
    };
  }
}
