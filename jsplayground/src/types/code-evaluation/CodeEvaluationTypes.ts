import * as esprima from "esprima";

export type ExpressionMap = Record<number, string>;
export interface CustomLoc extends esprima.Token {
  loc: {
    end: {
      line: number;
      column: number;
    };
  };
}
