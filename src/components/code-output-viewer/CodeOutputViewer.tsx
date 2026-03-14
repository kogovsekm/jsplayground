import { useSetAtom } from "jotai";
import React, { useCallback, useEffect } from "react";
import isEqual from "react-fast-compare";
import { Separator } from "@/components/ui/separator";
import { interpretCode } from "../../helpers/code-evaluation.helpers";
import { CodeErrorValueAtom } from "../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../state/atoms/CodeStatusAtom";
import { CodeOutputViewerProps } from "../../types/components/code-output-viewer-types/CodeOutputViewerTypes";
import { CustomErrorObject } from "../../types/errors/ErrorTypes";

/**
 * @description Evaluates editor expressions and renders their computed output values.
 * @param {CodeOutputViewerProps} props - Component props containing the debounced code string.
 * @returns {JSX.Element} The rendered output list.
 */
const CodeOutputViewer = ({ codeValue }: CodeOutputViewerProps) => {
  const setError = useSetAtom(CodeErrorValueAtom);
  const setStatus = useSetAtom(CodeStatusValueAtom);
  const [resultsArray, setResultsArray] = React.useState<Array<string>>([]);

  const handleSuccess = useCallback(() => {
    setError({
      title: "Error",
      message: "",
    });
    setStatus("success");
  }, [setError, setStatus]);

  const handleError = useCallback(
    ({ title, message }: CustomErrorObject) => {
      setError({
        title,
        message,
      });

      setStatus("error");
    },
    [setError, setStatus],
  );

  /**
   * This effect will run every time the codeValue changes and will evaluate the entire chunk of code.
   */
  useEffect(() => {
    try {
      eval(codeValue);
      handleSuccess();
    } catch (e) {
      const error = e as Error;
      handleError({
        title: error.name,
        message: error.message,
      });
    }
  }, [codeValue, handleError, handleSuccess]);

  useEffect(() => {
    let tempResultsArr: Array<string> = [];

    try {
      const expressions = interpretCode(codeValue);

      for (const expression of Object.entries(expressions)) {
        try {
          const codeString = expression[1];
          const func = new Function(
            "codeString",
            codeString + "\nreturn eval(codeString);",
          );
          const result = func(codeString);

          if (
            result &&
            (typeof result === "object" ||
              typeof result === "function" ||
              Array.isArray(result) ||
              typeof result === "number" ||
              typeof result === "string")
          ) {
            tempResultsArr.push(JSON.stringify(result));
          } else if (result && typeof result === "boolean") {
            tempResultsArr.push(result ? "True" : "False");
          }

          tempResultsArr = [...new Set(tempResultsArr)];
        } catch (e) {
          const error = e as Error;
          handleError({
            title: error.name,
            message: error.message,
          });
        }
      }
    } catch (e) {
      const error = e as Error;
      handleError({
        title: error.name,
        message: error.message,
      });
    }

    setResultsArray(() => {
      return [...new Set([...tempResultsArr])];
    });
  }, [codeValue, handleError]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-border/60 bg-[var(--panel-muted)] p-4">
      {resultsArray.length > 0 ? (
        <div className="space-y-3 text-sm text-foreground">
          {resultsArray.map((result, index) => {
            return (
              <div key={`${index}-${result}`} className="space-y-3">
                {index > 0 ? <Separator /> : null}
                <div className="break-words font-mono text-xs leading-6 text-slate-200">
                  {result}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Run valid code to inspect evaluated expression output.
        </div>
      )}
    </div>
  );
};

CodeOutputViewer.displayName = "CodeOutputViewer";

export default React.memo(CodeOutputViewer, isEqual);
