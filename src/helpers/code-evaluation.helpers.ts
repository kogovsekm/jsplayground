/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Babel from "@babel/standalone";
import * as esprima from "esprima";
import {
  CustomLoc,
  ExpressionMap,
} from "../types/code-evaluation/CodeEvaluationTypes";
import {
  CLOSE_DELIMITERS,
  DELIMITER_MAP,
  OPEN_DELIMITERS,
} from "../vars/globalVars";

/**
 * @description Locates the number of delimiters that are on the same line as the end of the expression
 *
 * @param { column: number} end  - The column number of the end of the expression
 * @param {string} lineContents  - The contents of the line of code that the expression is on
 * @returns
 */
const locateDelimiters = (end: { column: number }, lineContents: string) => {
  const lineAfterEnd = lineContents.substring(end.column);
  const delimiters = OPEN_DELIMITERS.filter((d) => lineAfterEnd.includes(d));
  return delimiters.length;
};

/**
 * @description Parses a string of code and returns an object with the line number as the key and the code up to that line as the value
 *
 * @param {string} code - The code to parse
 * @returns {ExpressionMap}
 */
export const interpretCode = (code: string) => {
  const transformedCode = Babel.transform(code, { presets: ["react"] }).code;
  const codeByLine = transformedCode?.split("\n");
  const tokenized = esprima.tokenize(transformedCode || "", {
    loc: true,
  }) as Array<CustomLoc>;

  const parens: Record<string, number> = { "(": 0, "{": 0, "[": 0 };
  let wasOpen = false;
  const exp: ExpressionMap = tokenized.reduce(
    (
      expressions: Record<number, string>,
      { value, loc: { end } }: CustomLoc
    ) => {
      const lineNumber = end.line;
      const lineContents = codeByLine ? codeByLine[lineNumber - 1] : "";
      const lineHasMoreDelimiters = locateDelimiters(end, lineContents);

      if (expressions[lineNumber]) {
        return expressions;
      }

      if (OPEN_DELIMITERS.includes(value)) {
        parens[value] += 1;
        wasOpen = true;
      }

      if (CLOSE_DELIMITERS.includes(value)) {
        parens[DELIMITER_MAP[value]] -= 1;
      }

      if (
        !lineHasMoreDelimiters &&
        wasOpen &&
        Object.values(parens).every((count) => count === 0)
      ) {
        wasOpen = false;
        expressions[lineNumber] = codeByLine
          ? codeByLine.slice(0, lineNumber).join("\n")
          : "";
        return expressions;
      }

      if (
        !lineHasMoreDelimiters &&
        Object.values(parens).every((count) => count === 0)
      ) {
        expressions[lineNumber] = codeByLine
          ? codeByLine.slice(0, lineNumber).join("\n")
          : "";
        return expressions;
      }

      return expressions;
    },
    {}
  );

  return exp;
};
