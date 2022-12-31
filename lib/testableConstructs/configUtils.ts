import {
  identifier,
  isIdentifier,
  isTSPropertySignature,
  isTSTypeLiteral,
  tsPropertySignature,
  tsStringKeyword,
  tsTypeAnnotation,
  TSTypeElement,
} from "@babel/types";
import fs from "fs";
import { parse, print } from "recast";
import traverse, { Node } from "@babel/traverse";

const membersContainsVarDeclaration = (
  members: TSTypeElement[],
  envVar: string
): boolean => {
  return members.some((member) => {
    if (isTSPropertySignature(member)) {
      const { key } = member;
      if (isIdentifier(key)) {
        return key.name === envVar;
      }
    }
    return false;
  });
};
// This is extremely fast: first call take max 10ms, subsequent calls take max 2ms
// So it can be called on every CDK synth without any performance impact
export const syncConfigTypes = (envVar: string): void => {
  const filePath = "./src/config/types.ts"; // TODO: make this configurable
  try {
    const testFile = fs.readFileSync(filePath).toString();
    const ast = parse(testFile, {
      // parser is not typed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parser: require("recast/parsers/typescript"),
    }) as Node;
    traverse(ast, {
      TSTypeAliasDeclaration: (path) => {
        const { node } = path;
        const {
          id: { name: declaredTypeName },
          typeAnnotation,
        } = node;
        if (
          declaredTypeName == "InitializedConfigs" &&
          isTSTypeLiteral(typeAnnotation)
        ) {
          const { members } = typeAnnotation;
          if (!membersContainsVarDeclaration(members, envVar)) {
            members.push(
              tsPropertySignature(
                identifier(envVar),
                tsTypeAnnotation(tsStringKeyword())
              )
            );
            const updatedFile = print(ast).code;
            fs.writeFileSync(filePath, updatedFile);
          }
        }
      },
    });
  } catch (e) {
    console.warn(`Error while trying to sync config types: ${e}`);
    return;
  }
};
