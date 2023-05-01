import { selector } from "recoil";
import { CodeStatusValueAtom } from "../atoms/CodeStatusAtom";
import { CodeSanitizationSelector } from "./CodeSanitizationSelector";

export const CodeStatusSelector = selector({
  key: "CodeStatusSelector",
  get: ({ get }) => {
    const codeValueObserver = get(CodeSanitizationSelector);
    const codeStatusObserver = get(CodeStatusValueAtom);

    if (codeValueObserver.trim() === "") {
      return "no-code";
    }

    if (codeStatusObserver === "error") {
      return "error";
    }

    if (codeStatusObserver === "success") {
      return "success";
    }

    return "no-code";
  },
});
