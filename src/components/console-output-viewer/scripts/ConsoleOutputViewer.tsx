import isEqual from "react-fast-compare";
import React, { useCallback, useEffect, useState } from "react";
import { CodeErrorValueAtom } from "../../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../../state/atoms/CodeStatusAtom";
import { CustomErrorObject } from "../../../types/errors/ErrorTypes";
import { Separator } from "@/components/ui/separator";
import "../styles/ConsoleOutputViewer.css";
import {
  ConsoleOutput,
  ConsoleOutputViewerProps,
} from "../../../types/components/console-output-viewer-types/ConsoleOutputViewerTypes";
import { useSetAtom } from "jotai";

/**
 * @description ConsoleOutputViewer will hijack the console.log function and capture the output of the code. It will then display the output in a list.
 *
 * @param {string} codeValue - The code to be evaluated
 * @returns {JSX.Element}
 */
const ConsoleOutputViewer = ({ codeValue }: ConsoleOutputViewerProps) => {
  const setError = useSetAtom(CodeErrorValueAtom);
  const setStatus = useSetAtom(CodeStatusValueAtom);
  const [consoleOutput, setConsoleOutput] = useState<Array<ConsoleOutput>>([]);

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

  const runConsoleCode = useCallback(() => {
    const log = console.log;
    const capturedOutput: Array<ConsoleOutput> = [];

    console.log = (...args: ConsoleOutput) => {
      capturedOutput.push(args);
      log(...args);
    };

    try {
      eval(codeValue);
      setConsoleOutput(capturedOutput);
      handleSuccess();
    } catch (e) {
      const error = e as Error;
      handleError({
        title: error.name,
        message: error.message,
      });
    }

    console.log = log;
  }, [codeValue, handleError, handleSuccess]);

  useEffect(() => {
    runConsoleCode();
  }, [codeValue, runConsoleCode]);

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
};

ConsoleOutputViewer.displayName = "ConsoleOutputViewer";

export default React.memo(ConsoleOutputViewer, isEqual);
