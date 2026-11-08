import { useSetAtom } from "jotai";
import { useEffect, useState, type ReactElement } from "react";
import { Separator } from "@/components/ui/separator";
import { interpretCode } from "../../helpers/code-evaluation.helpers";
import { CodeErrorValueAtom } from "../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../state/atoms/CodeStatusAtom";
import { CodeOutputViewerProps } from "../../types/components/code-output-viewer-types/CodeOutputViewerTypes";

const DEFERRED_EVALUATION_DELAY_MS = 0;

/**
 * @description Evaluates editor expressions and renders their computed output values.
 * @param props - Component properties.
 * @param props.codeValue - Debounced code to evaluate and display.
 * @returns The rendered output list.
 */
function CodeOutputViewer({
  codeValue,
}: CodeOutputViewerProps): ReactElement {
  const setError = useSetAtom(CodeErrorValueAtom);
  const setStatus = useSetAtom(CodeStatusValueAtom);
  const [resultsArray, setResultsArray] = useState<Array<string>>([]);

  /**
   * This effect runs user code outside React and defers React updates to the timer callback.
   */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        eval(codeValue);
        setError({
          title: "Error",
          message: "",
        });
        setStatus("success");
      } catch (e) {
        const error = e as Error;
        setError({
          title: error.name,
          message: error.message,
        });
        setStatus("error");
      }
    }, DEFERRED_EVALUATION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [codeValue, setError, setStatus]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
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
            setError({
              title: error.name,
              message: error.message,
            });
            setStatus("error");
          }
        }
      } catch (e) {
        const error = e as Error;
        setError({
          title: error.name,
          message: error.message,
        });
        setStatus("error");
      }

      setResultsArray(() => {
        return [...new Set([...tempResultsArr])];
      });
    }, DEFERRED_EVALUATION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [codeValue, setError, setStatus]);

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
}

export default CodeOutputViewer;
