import { Queue as CdkQueue, QueueProps } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { TestableConstruct } from "./types";

export class Queue extends CdkQueue implements TestableConstruct {
  testDownConstruct: CdkQueue;
  testUpConstruct: CdkQueue;
  constructor(scope: Construct, id: string, props?: QueueProps) {
    super(scope, id, props);
    this.testDownConstruct = new CdkQueue(scope, `TestDown${id}`, props);
    this.testUpConstruct = new CdkQueue(scope, `TestUp${id}`, props);
  }
}
