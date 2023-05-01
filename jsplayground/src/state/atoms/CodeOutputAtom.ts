import { atom } from "recoil";

export const CodeOutputAtom = atom<JSX.Element | null>({
  key: "CodeOutputAtom",
  default: null,
});
