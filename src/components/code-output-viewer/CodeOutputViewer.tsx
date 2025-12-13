import { Box, Divider } from "@mantine/core";
import { useSetAtom } from "jotai";
import React, { useCallback, useEffect, useMemo } from "react";
import isEqual from "react-fast-compare";
import { interpretCode } from "../../helpers/code-evaluation.helpers";
import { CodeErrorValueAtom } from "../../state/atoms/CodeErrorValueAtom";
import { CodeStatusValueAtom } from "../../state/atoms/CodeStatusAtom";
import { CodeOutputViewerProps } from "../../types/components/code-output-viewer-types/CodeOutputViewerTypes";
import { CustomErrorObject } from "../../types/errors/ErrorTypes";

const CodeOutputViewer: React.FC<CodeOutputViewerProps> = ({
  codeValue,
}: CodeOutputViewerProps) => {
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
    [setError, setStatus]
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
            codeString + "\nreturn eval(codeString);"
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

  const codeOutput = useMemo((): Array<JSX.Element> | null => {
    const elementsArray: Array<JSX.Element> = [];

    resultsArray.forEach((result, index) => {
      elementsArray.push(
        <div key={`${index}-${result}`}>
          {index > 0 && <Divider />}
          <div>{result}</div>
        </div>
      );
    }, []);

    return elementsArray;
  }, [resultsArray]);

  return <Box p={4}>{codeOutput}</Box>;
};

CodeOutputViewer.displayName = "CodeOutputViewer";

export default React.memo(CodeOutputViewer, isEqual);
