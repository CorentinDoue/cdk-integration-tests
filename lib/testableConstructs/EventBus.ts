import { EventBus as CdkEventBus, EventBusProps } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { NodejsFunction } from "./NodejsFunction";
import { Grant } from "aws-cdk-lib/aws-iam";
import { TestableConstruct } from "./types";
import { getTestStack } from "./testStack";

export class EventBus extends CdkEventBus implements TestableConstruct {
  testUpConstruct: CdkEventBus;
  testDownConstruct: CdkEventBus;
  constructor(scope: Construct, id: string, props?: EventBusProps) {
    super(scope, id, props);
    const testStack = getTestStack();
    this.testUpConstruct = new CdkEventBus(testStack, `TestUp${id}`, props);
    this.testDownConstruct = new CdkEventBus(testStack, `TestDown${id}`, props);
  }
  grantPutEventsTo(grantee: NodejsFunction<any>): Grant {
    this.testDownConstruct.grantPutEventsTo(grantee.testFunction);
    return super.grantPutEventsTo(grantee);
  }
}
