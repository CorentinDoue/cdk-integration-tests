import {
  Rule as CdkRule,
  RuleProps as CdkRuleProps,
} from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { EventBus } from "./EventBus";
import { LambdaFunction } from "./Target";

type RuleProps = Omit<CdkRuleProps, "targets" | "eventBus"> & {
  eventBus: EventBus;
  targets: LambdaFunction[];
};
export class Rule extends CdkRule {
  testConstruct: CdkRule;

  constructor(scope: Construct, id: string, props: RuleProps) {
    super(scope, id, props);
    this.testConstruct = new CdkRule(scope, `Test${id}`, {
      ...props,
      eventBus: props.eventBus.testUpConstruct,
      targets: props.targets.map((target) => target.testConstruct),
    });
  }
}
