import isEqual from "react-fast-compare";
import React, { useCallback, useEffect, useState } from "react";
import { useResetRecoilState, useSetRecoilState } from "recoil";
import { CodeErrorValueAtom } from "../../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../../state/atoms/CodeStatusAtom";
import { CustomErrorObject } from "../../../types/errors/ErrorTypes";
import { Divider } from "@mantine/core";
import "../styles/ConsoleOutputViewer.css";
import {
  ConsoleOutput,
  ConsoleOutputViewerProps,
} from "../../../types/components/console-output-viewer-types/ConsoleOutputViewerTypes";

/**
 * @description ConsoleOutputViewer will hijack the console.log function and capture the output of the code. It will then display the output in a list.
 *
 * @param {string} codeValue - The code to be evaluated
 * @returns {JSX.Element}
 */
const ConsoleOutputViewer: React.FC<ConsoleOutputViewerProps> = ({
  codeValue,
}: ConsoleOutputViewerProps) => {
  const setError = useSetRecoilState(CodeErrorValueAtom);
  const resetErrorObj = useResetRecoilState(CodeErrorValueAtom);
  const setStatus = useSetRecoilState(CodeStatusValueAtom);
  const [consoleOutput, setConsoleOutput] = useState<Array<ConsoleOutput>>([]);

  const handleSuccess = useCallback(() => {
    resetErrorObj();
    setStatus("success");
  }, [resetErrorObj, setStatus]);

  const handleError = useCallback(
    ({ title, message }: CustomErrorObject) => {
      setError({
        title,
        message,
      });

      setStatus("error");
    },
    [setError, setStatus]
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
    <>
      <div>
        {consoleOutput.map((output, consoleOutputIndex) => (
          <>
            {consoleOutputIndex !== 0 && <Divider p={4} />}
            <div key={JSON.stringify(output)}>
              {output.map((arg) => (
                <span className="console-text-value" key={JSON.stringify(arg)}>
                  {JSON.stringify(arg)}
                </span>
              ))}
            </div>
          </>
        ))}
      </div>
    </>
  );
};

ConsoleOutputViewer.displayName = "ConsoleOutputViewer";

export default React.memo(ConsoleOutputViewer, isEqual);
