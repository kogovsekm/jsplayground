import { selector } from "recoil";
import { CodeValueAtom } from "../atoms/CodeValueAtom";

export const CodeSanitizationSelector = selector({
  key: "CodeSanitizationSelector",
  get: ({ get }) => {
    const codeValueObserver = get(CodeValueAtom);

    // Sanitize codeValueObserver here by removing script tags
    const scriptTagSanitization = codeValueObserver.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    return scriptTagSanitization;
  },
});
