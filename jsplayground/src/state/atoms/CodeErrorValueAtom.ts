import { atom } from "recoil";
import { CustomErrorObject } from "../../types/errors/ErrorTypes";

export const CodeErrorValueAtom = atom<CustomErrorObject>({
  key: "CodeErrorValueAtom",
  default: {
    title: "Error",
    message: "",
  },
});
