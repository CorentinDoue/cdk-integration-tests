import { Table } from "dynamodb-toolbox";
import { PARTITION_KEY, SORT_KEY } from "./keys";
import DynamoDB from "aws-sdk/clients/dynamodb";

const DocumentClient = new DynamoDB.DocumentClient({
  // Specify your client options as usual
  convertEmptyValues: false,
});

export default new Table({
  name: process.env.TABLE_NAME ?? "NeverUsed",
  partitionKey: PARTITION_KEY,
  sortKey: SORT_KEY,
  autoExecute: true,
  autoParse: true,
  DocumentClient,
});
