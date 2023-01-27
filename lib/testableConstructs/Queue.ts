import { Queue as CdkQueue, QueueProps } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { TestableConstruct } from "./types";
import { getTestStack, shouldDeployTestConstructs } from "./testStack";

export class Queue extends CdkQueue implements TestableConstruct {
  testDownConstruct: CdkQueue;
  testUpConstruct: CdkQueue;
  constructor(scope: Construct, id: string, props?: QueueProps) {
    super(scope, id, props);
    if (shouldDeployTestConstructs(scope)) {
      const testStack = getTestStack();
      this.testDownConstruct = new CdkQueue(testStack, `TestDown${id}`, props);
      this.testUpConstruct = new CdkQueue(testStack, `TestUp${id}`, props);
    }
  }
}
