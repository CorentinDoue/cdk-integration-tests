import { NestedStack } from "aws-cdk-lib";
import { Construct } from "constructs";

const GLOBAL_CONTEXT: { testStack?: NestedStack } = {};
export const initTestStack = (scope: Construct): void => {
  GLOBAL_CONTEXT.testStack = new NestedStack(scope, "TestStack");
};

export const getTestStack = (): NestedStack => {
  const { testStack } = GLOBAL_CONTEXT;
  if (!testStack) {
    throw new Error("Test stack not initialized");
  }
  return testStack;
};

export const shouldDeployTestConstructs = (scope: Construct): boolean =>
  scope.node.tryGetContext("deployTestConstructs") ?? false;
