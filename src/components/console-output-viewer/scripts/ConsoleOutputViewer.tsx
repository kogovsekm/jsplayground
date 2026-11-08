import { useEffect, useState, type ReactElement } from "react";
import { CodeErrorValueAtom } from "../../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../../state/atoms/CodeStatusAtom";
import { Separator } from "@/components/ui/separator";
import "../styles/ConsoleOutputViewer.css";
import {
  ConsoleOutput,
  ConsoleOutputViewerProps,
} from "../../../types/components/console-output-viewer-types/ConsoleOutputViewerTypes";
import { useSetAtom } from "jotai";

const DEFERRED_EVALUATION_DELAY_MS = 0;

/**
 * @description ConsoleOutputViewer will hijack the console.log function and capture the output of the code. It will then display the output in a list.
 *
 * @param props - Component properties.
 * @param props.codeValue - Code to evaluate while capturing console output.
 * @returns The rendered console output list.
 */
function ConsoleOutputViewer({
  codeValue,
}: ConsoleOutputViewerProps): ReactElement {
  const setError = useSetAtom(CodeErrorValueAtom);
  const setStatus = useSetAtom(CodeStatusValueAtom);
  const [consoleOutput, setConsoleOutput] = useState<Array<ConsoleOutput>>([]);

  useEffect(() => {
    /** User code execution is external to React, and the timer prevents synchronous effect updates. */
    const timeoutId = window.setTimeout(() => {
      const log = console.log;
      const capturedOutput: Array<ConsoleOutput> = [];

      console.log = (...args: ConsoleOutput) => {
        capturedOutput.push(args);
        log(...args);
      };

      try {
        eval(codeValue);
        setConsoleOutput(capturedOutput);
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
      } finally {
        console.log = log;
      }
    }, DEFERRED_EVALUATION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [codeValue, setError, setStatus]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-border/60 bg-[var(--panel-muted)] p-4">
      <div>
        {consoleOutput.map((output, consoleOutputIndex) => {
          const outputKey = JSON.stringify(output);

          return (
            <div className="space-y-3" key={outputKey}>
              {consoleOutputIndex !== 0 ? <Separator /> : null}
              <div>
                {output.map((arg, argIndex) => {
                  return (
                    <span
                      className="console-text-value"
                      key={`${outputKey}-${argIndex}`}
                    >
                      {JSON.stringify(arg)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsoleOutputViewer;
