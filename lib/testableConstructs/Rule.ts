import {
  Rule as CdkRule,
  RuleProps as CdkRuleProps,
} from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { EventBus } from "./EventBus";
import { LambdaFunction } from "./Target";
import { getTestStack, shouldDeployTestConstructs } from "./testStack";

type RuleProps = Omit<CdkRuleProps, "targets" | "eventBus"> & {
  eventBus: EventBus;
  targets: LambdaFunction[];
};
export class Rule extends CdkRule {
  testConstruct: CdkRule;

  constructor(scope: Construct, id: string, props: RuleProps) {
    super(scope, id, props);
    if (shouldDeployTestConstructs(scope)) {
      const testStack = getTestStack();
      this.testConstruct = new CdkRule(testStack, `Test${id}`, {
        ...props,
        eventBus: props.eventBus.testUpConstruct,
        targets: props.targets.map((target) => target.testConstruct),
      });
    }
  }
}
