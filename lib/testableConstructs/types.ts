import { Construct } from "constructs";

export interface TestableConstruct {
  testUpConstruct?: Construct;
  testDownConstruct: Construct;
}
