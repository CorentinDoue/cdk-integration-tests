import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Table } from "dynamodb-toolbox";
import { PARTITION_KEY, SORT_KEY } from "./keys";

const documentClient = new DocumentClient({
  region: "us-east-1",
});

export default new Table({
  name: process.env.TABLE_NAME ?? "NeverUsed",
  partitionKey: PARTITION_KEY,
  sortKey: SORT_KEY,
  autoExecute: true,
  autoParse: true,
  DocumentClient: documentClient,
});
