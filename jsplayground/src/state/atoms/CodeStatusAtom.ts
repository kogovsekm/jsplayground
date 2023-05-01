import { atom } from "recoil";
import { CodeStatus } from "../../types/status/CodeStatusTypes";

export const CodeStatusValueAtom = atom<CodeStatus>({
  key: "CodeStatusValueAtom",
  default: "success",
});
