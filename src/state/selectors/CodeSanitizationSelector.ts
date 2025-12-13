import { atom } from "jotai";
import { CodeValueAtom } from "../atoms/CodeValueAtom";

export const CodeSanitizationSelector = atom((get) => {
  const codeValueObserver = get(CodeValueAtom);

  const scriptTagSanitization = codeValueObserver.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  return scriptTagSanitization;
});
