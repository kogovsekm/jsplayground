export type ExpressionMap = Record<number, string>;
export interface CustomLoc {
  value: string;
  loc: {
    end: {
      line: number;
      column: number;
    };
  };
}
