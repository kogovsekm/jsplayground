import { atom } from "jotai";
import { CustomErrorObject } from "../../types/errors/ErrorTypes";

export const CodeErrorValueAtom = atom<CustomErrorObject>({
  title: "Error",
  message: "",
});
