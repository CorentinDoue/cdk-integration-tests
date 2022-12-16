import { Table as CdkTable, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "./NodejsFunction";

export class Table extends CdkTable {
  testUpConstruct?: CdkTable;
  testDownConstruct: CdkTable;
  constructor(scope: Construct, id: string, props: TableProps) {
    super(scope, id, props);
    if (props.stream !== undefined) {
      this.testUpConstruct = new CdkTable(scope, `TestUp${id}`, props);
    }
    this.testDownConstruct = new CdkTable(scope, `TestDown${id}`, props);
  }
  grantReadWriteData(grantee: NodejsFunction<any>): Grant {
    this.testDownConstruct.grantReadWriteData(grantee.testFunction);
    return super.grantReadWriteData(grantee);
  }
}
