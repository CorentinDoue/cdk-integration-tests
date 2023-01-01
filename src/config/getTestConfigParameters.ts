import {
  GetParametersByPathCommand,
  Parameter,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { testConfigParameterPath } from "../../lib/testableConstructs/configConsts";

const client = new SSMClient({});

export const getTestConfigParameters = async (
  lastCommandNextToken?: string
): Promise<Parameter[]> => {
  const command = new GetParametersByPathCommand({
    Path: `/${testConfigParameterPath}`,
    Recursive: true,
    WithDecryption: true,
    NextToken: lastCommandNextToken,
  });
  const { Parameters, NextToken } = await client.send(command);
  if (NextToken) {
    return [
      ...(Parameters ?? []),
      ...(await getTestConfigParameters(NextToken)),
    ];
  }
  return Parameters ?? [];
};
